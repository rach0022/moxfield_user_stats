from dataclasses import dataclass
import requests
from core.api.base import BaseAPIAgent
from exceptions import ScryfallCardNotFoundException
from utils import to_magic_cards


@dataclass
class ScryfallAgent(BaseAPIAgent):
    @classmethod
    def get_card_information(cls, card_name: str, count: int = 1):
        get_card_info_request = requests.get(
            url="https://api.scryfall.com/cards/named",
            params=dict(exact=card_name),
            headers=cls.generate_request_header()
        )

        if get_card_info_request.status_code == 200:
            card_json_info = get_card_info_request.json()
            return to_magic_cards(scryfall_response=dict(**card_json_info, quantity=count))
        else:
            raise ScryfallCardNotFoundException(card_name=card_name)
