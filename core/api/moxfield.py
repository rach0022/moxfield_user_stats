import json
from dataclasses import dataclass

import requests

from utils import get_random_user_agent


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
