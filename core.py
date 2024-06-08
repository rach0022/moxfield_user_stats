import heapq
import json
from dataclasses import dataclass, field
from datetime import datetime
from typing import List

import requests

from utils import get_random_user_agent, COLOUR_NAMES


@dataclass
class MagicCard:
    id: str
    name: str
    quantity: int
    is_foil: bool
    converted_mana_cost: float = 0
    type: str = ""

    @property
    def is_land(self) -> bool:
        return "Land" in self.type

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
    is_legal: bool = False

    @staticmethod
    def from_json(json_response):
        return MagicDeckList(
            id=json_response["publicId"],
            name=json_response["name"],
            colour_identity=json_response["colorIdentity"],
            url=json_response['publicUrl'],
            is_legal=json_response['isLegal']
        )


@dataclass
class EDHDeckList(MagicDeckList):
    name: str = ""
    is_legal: bool = False
    main_board: List[MagicCard] = field(default_factory=lambda: [])
    commanders: List[MagicCard] = field(default_factory=lambda: [])
    companions: List[MagicCard] = field(default_factory=lambda: [])
    side_board: List[MagicCard] = field(default_factory=lambda: [])
    maybe_board: List[MagicCard] = field(default_factory=lambda: [])
    tokens: List[MagicCard] = field(default_factory=lambda: [])
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    def get_average_mana_cost(self):
        """Get the average mana cost of the deck without lands"""
        total_mana_cost = sum(card.converted_mana_cost for card in self.main_board)
        total_mana_cost += sum(commander.converted_mana_cost for commander in self.commanders)
        total_lands = self.get_land_count()
        return total_mana_cost / (len(self.main_board) + len(self.commanders) + len(self.companions) - total_lands)

    def get_land_count(self):
        return sum(card.quantity for card in list(filter(lambda card: card.is_land, self.main_board)))

    @staticmethod
    def from_json(json_response):
        # First get a list of the commanders in the deck:
        # commanders = [commander for commander in json_response["commanders"].keys()]
        return EDHDeckList(
            id=json_response["id"],
            name=json_response["name"],
            is_legal=json_response['is_legal'],
            colour_identity=json_response["colour_identity"],
            url=json_response['url'],
            commanders=to_cards(json_response['commanders']),
            companions=to_cards(json_response["companions"]),
            main_board=to_cards(json_response["mainboard"]),
            side_board=to_cards(json_response["sideboard"]),
            tokens=to_cards(json_response['tokens']),
            created_at=json_response['createdAtUtc'],
            updated_at=json_response['lastUpdatedAtUtc']
        )

    def __str__(self):
        main_board_count = sum([card.quantity for card in self.main_board])
        colour_identity = COLOUR_NAMES[''.join(self.colour_identity)]
        commanders = ','.join([str(commander.name) for commander in self.commanders])
        return f"{self.name} (Commander: {commanders}) | MainBoard: {main_board_count} | CI: {colour_identity} | Average CMC: {self.get_average_mana_cost()}"


@dataclass
class MoxFieldUser:
    username: str = ""
    profile_picture: str = ""
    edh_decks: List[EDHDeckList] = field(default_factory=lambda: [])

    def get_card_counts(self, include_lands=True):
        """Get the counts for each card in every deck"""

        # Set up a dict to track each card by the name as the key and the count as the value
        card_counts_dict = dict()
        for deck in self.edh_decks:
            for commander in deck.commanders:
                # If we find the Commander name in the dict then increment the value or initialize it to 1
                if commander.name not in card_counts_dict:
                    card_counts_dict[commander.name] = commander.quantity
                else:
                    card_counts_dict[commander.name] += commander.quantity

            for card in deck.main_board:
                # If we are not including lands, and we find a land card then skip this loop iteration
                if not include_lands and card.is_land:
                    continue

                # If we find the Card name in the dict then increment the value or initialize it to 1
                if card.name not in card_counts_dict:
                    card_counts_dict[card.name] = card.quantity
                else:
                    card_counts_dict[card.name] += card.quantity
        return card_counts_dict

    def get_top_ten_cards(self, include_lands=False):
        # First get the card counts from all the decks and ignore any lands (by default)
        deck_card_counts = self.get_card_counts(include_lands=include_lands)

        # Using heapq nlargest function we can get the 10 largest items from this dict
        return heapq.nlargest(10, deck_card_counts.items(), key=lambda x: x[1])


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
