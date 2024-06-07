import json
from dataclasses import dataclass, field
from typing import List

import requests

from utils import get_random_user_agent, COLOUR_NAMES


@dataclass
class MagicCard:
    name: str
    quantity: int


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
        return f"{self.name} (Commander: {','.join(self.commanders)}) | MainBoard: {main_board_count} | CI: {colour_identity}"


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


def to_cards(raw_cards: dict) -> List[MagicCard]:
    def create_card(card: dict) -> MagicCard:
        if isinstance(card, str):
            return MagicCard(card.split(" // ")[0], quantity=1)
        if 'quantity' in card:
            return MagicCard(card['name'].split(" // ")[0], quantity=int(card['quantity']))
        return MagicCard(card['name'].split(" // ")[0], quantity=1)

    return [create_card(card) for card in raw_cards]
