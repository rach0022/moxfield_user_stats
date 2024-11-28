import json
from dataclasses import dataclass

import requests

from user_stats_app.core.api.base import BaseAPIAgent
from exceptions import UserNotFoundException, MoxfieldAPIException


@dataclass
class MoxFieldAgent(BaseAPIAgent):
    username: str = ""

    def get_user_decks(self):
        # Create the GET request to the moxfield API to get the users decks
        # Because of Cloudflare protection, this application may be dead
        moxfield_request = requests.get(
            url="https://api2.moxfield.com/v2/decks/search-sfw",
            headers=self.generate_request_header(),
            params=dict(
                authorUserNames=self.username, pageSize=99999, pageNumber=1, includePinned=True, showIllegal=True
            )
        )
        # Check if we have an error in the request
        if moxfield_request.status_code != 200 and moxfield_request.status_code != 404:
            raise MoxfieldAPIException(http_status_code=moxfield_request.status_code)
        elif moxfield_request.status_code == 404:
            raise UserNotFoundException(username=self.username)

        # Load the response data and return to the front-end
        json_response = json.loads(moxfield_request.text)
        return json_response['data']

    def get_deck_list(self, deck_id: str):
        mox_field_deck_api_url = f"https://api.moxfield.com/v2/decks/all/{deck_id}"
        api_request = requests.get(mox_field_deck_api_url, headers=self.generate_request_header())
        json_response = json.loads(api_request.text)
        return json_response
