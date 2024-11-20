import json
from dataclasses import dataclass, field
from typing import List

import requests

from user_stats_app.core import EDHDeckList, MoxFieldUser
from user_stats_app.core.api.base import BaseAPIAgent


@dataclass
class CommanderSpellBookAgent(BaseAPIAgent):
    moxfield_user: MoxFieldUser

    def get_all_user_deck_combos(self):
        """Get all the potential combos in all the EDh decks for this user"""
        # Fid the combos and set them in each deck
        for deck in self.moxfield_user.edh_decks:
            combos = self.get_combos(edh_deck=deck)
            # Check if we even have any combos provided from commander spellbook
            if 'results' in combos.keys():
                deck.combos_found = combos['results']['included']
                deck.potential_combos = combos['results']['almostIncluded']

    @classmethod
    def get_combos(cls, edh_deck: EDHDeckList):
        # first construct a list of the card names to send to the API endPoint
        request_dict = dict()
        request_dict['main'] = [dict(card=card.name, quantity=card.quantity) for card in edh_deck.main_board]
        request_dict['main'].extend([dict(card=card.name, quantity=card.quantity) for card in edh_deck.companions])
        request_dict['commanders'] = [dict(card=card.name, quantity=card.quantity) for card in edh_deck.commanders]
        # Now construct the request to the Commander Spell Book Endpoint for find my combos
        find_my_combos_response = requests.post(
            url='https://backend.commanderspellbook.com/find-my-combos',
            json=request_dict,
            headers=cls.generate_request_header()
        )
        json_response = json.loads(find_my_combos_response.text)
        return json_response

    @staticmethod
    def find_combos_in_moxfield_user_decks(moxfield_user: MoxFieldUser):
        """Create an instance of the CommanderSpellBook Agent and find all the user combos and return"""
        commander_spell_book_agent = CommanderSpellBookAgent(moxfield_user)
        commander_spell_book_agent.get_all_user_deck_combos()
        return commander_spell_book_agent
