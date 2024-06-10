import json
from dataclasses import dataclass, field
from typing import List

import requests

from core import EDHDeckList, MoxFieldUser
from core.api.base import BaseAPIAgent


@dataclass
class CommanderSpellBookAgent(BaseAPIAgent):
    moxfield_user: MoxFieldUser

    def get_all_user_deck_combos(self):
        """Get all the potential combos in all the EDh decks for this user"""
        # Fid the combos and set them in each deck
        for deck in self.moxfield_user.edh_decks:
            deck.combos_found = self.get_combos(edh_deck=deck)['results']['included']
            deck.potential_combos = self.get_combos(edh_deck=deck)['results']['almostIncluded']

    @classmethod
    def get_combos(cls, edh_deck: EDHDeckList):
        # first construct a list of the card names to send to the API endPoint
        card_names_list = [card.name for card in edh_deck.main_board]
        card_names_list.extend([card.name for card in edh_deck.companions])

        # Now construct the request to the Commander Spell Book Endpoint for find my combos
        find_my_combos_response = requests.post(
            url='https://backend.commanderspellbook.com/find-my-combos',
            json=dict(main=card_names_list, commanders=[card.name for card in edh_deck.commanders]),
            headers=cls.generate_request_header()
        )
        json_response = json.loads(find_my_combos_response.text)
        return json_response
