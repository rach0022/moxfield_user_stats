import json
from dataclasses import dataclass, field
from typing import List

import requests

from utils import get_random_user_agent, COLOUR_NAMES, USD_TO_CDN_CONVERSION_RATE


@dataclass
class MagicCard:
    id: str
    name: str
    quantity: int
    is_foil: bool
    converted_mana_cost: float = 0
    type: str = ""

    @staticmethod
    def from_json(card_name: str, attr: dict):
        try:
            return MagicCard(
                id=attr['scryfall_id'] if "scryfall_id" in attr else attr['card']['scryfall_id'],
                name=card_name,
                quantity=attr['quantity'] if "quantity" in attr else 1,
                is_foil=attr['isFoil'] if "isFoil" in attr else False,
                converted_mana_cost=attr['card'].get('cmc', 0) if "card" in attr else attr.get("cmc", 0),
                type=attr['card'].get('type_line', "") if "card" in attr else attr.get("type_line", "")
            )
        except KeyError as key_error:
            print("key error with card", card_name, attr, key_error)


@dataclass
class MagicDeckList:
    colour_identity: List[str] = field(default_factory=lambda: [])
    id: str = ""
    name: str = ""
    format: str = ""
    url: str = ""

    @staticmethod
    def from_json(json_response):
        return MagicDeckList(
            id=json_response["publicId"],
            name=json_response["name"],
            colour_identity=json_response["colorIdentity"],
            url=json_response['publicUrl'],
        )


@dataclass
class EDHDeckList(MagicDeckList):
    main_board: List[MagicCard] = field(default_factory=lambda: [])
    commanders: List[MagicCard] = field(default_factory=lambda: [])
    companions: List[MagicCard] = field(default_factory=lambda: [])
    side_board: List[MagicCard] = field(default_factory=lambda: [])
    maybe_board: List[MagicCard] = field(default_factory=lambda: [])
    tokens: List[MagicCard] = field(default_factory=lambda: [])

    def get_average_mana_cost(self):
        """Get the average mana cost of the deck without lands"""
        total_mana_cost = sum(card.converted_mana_cost for card in self.main_board)
        total_lands = self.get_land_count()
        return total_mana_cost / (len(self.main_board) + len(self.commanders) + len(self.companions) - total_lands)

    def get_land_count(self):
        return sum(card.quantity for card in list(filter(lambda card: "Land" in card.type, self.main_board)))

    @staticmethod
    def from_json(json_response):
        # First get a list of the commanders in the deck:
        commanders = [commander for commander in json_response["commanders"].keys()]
        return EDHDeckList(
            id=json_response["id"],
            name=json_response["name"],
            colour_identity=json_response["colour_identity"],
            url=json_response['url'],
            commanders=commanders,
            companions=to_cards(json_response["companions"]),
            main_board=to_cards(json_response["mainboard"]),
            side_board=to_cards(json_response["sideboard"]),
            tokens=to_cards(json_response['tokens']),
        )

    def __str__(self):
        main_board_count = sum([card.quantity for card in self.main_board])
        colour_identity = COLOUR_NAMES[''.join(self.colour_identity)]
        commanders = ','.join([str(commander) for commander in self.commanders])
        return f"{self.name} (Commander: {commanders}) | MainBoard: {main_board_count} | CI: {colour_identity} | Average CMC: {self.get_average_mana_cost()}"


@dataclass
class MoxFieldAgent:
    username: str = ""

    def get_user_decks(self):
        mox_field_user_api_url = f"https://api.moxfield.com/v2/users/{self.username}/decks?pageNumber=1&pageSize=99999"
        api_request = requests.get(mox_field_user_api_url, headers=self.generate_request_header())
        json_response = json.loads(api_request.text)
        return json_response['data']

    def get_deck_list(self, deck_id: str):
        mox_field_deck_api_url = f"https://api.moxfield.com/v2/decks/all/{deck_id}"
        api_request = requests.get(mox_field_deck_api_url, headers=self.generate_request_header())
        json_response = json.loads(api_request.text)
        return json_response

    @classmethod
    def generate_request_header(cls):
        return {
            'USER-AGENT': get_random_user_agent()
        }


def to_cards(raw_cards: dict | list) -> List[MagicCard]:
    if isinstance(raw_cards, list):
        return [MagicCard.from_json(card_data['name'], card_data) for card_data in raw_cards]
    # If raw data for cards is given as a dict object with they key as the card name and the value as the attributes
    return [MagicCard.from_json(card_name, attributes) for card_name, attributes in raw_cards.items()]
