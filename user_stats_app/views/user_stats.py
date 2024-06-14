import json

from django.http import JsonResponse
from django.shortcuts import render

from exceptions import UserNotFoundException
from user_stats_app.core import MoxFieldAgent, MagicDeckList, EDHDeckList, MoxFieldUser, CommanderSpellBookAgent, \
    ScryfallAgent
from utils import time_function


def home(request):
    return render(request, 'user_stats_app/user_decks.html')


def search_user_decks(request):
    if request.method == "POST":
        # First connect to the moxfield API and get all the user decks
        data = json.loads(request.body)
        user_name = data.get('user_name')
        include_lands = data.get('include_lands')
        moxfield_agent = MoxFieldAgent(user_name)

        # Try to get the user decks from the searched username and check if they exist or return an error
        try:
            user_deck_list_response = moxfield_agent.get_user_decks()
        except UserNotFoundException as error:
            return JsonResponse(dict(error=str(error)))

        # Transform the response into EDHDeckList objects
        user_deck_list = []
        for edh_deck in user_deck_list_response:
            if edh_deck['format'] == "commander" and edh_deck['isLegal']:
                user_deck_list.append(MagicDeckList.from_json(edh_deck))

        # Now with each MagicDeckList we can load the actual deck-lists from moxfield
        deck_cards_list = []
        for deck in user_deck_list:
            # Combine the response of the deck list with the response of the deck stats to create an EDHDeckList
            json_deck_list_response = moxfield_agent.get_deck_list(deck.id)
            json_deck_list_response.update(deck.__dict__)
            edh_deck = EDHDeckList.from_json(json_deck_list_response)

            # Check if the deck is legal before adding it to the list
            if edh_deck.is_legal:
                deck_cards_list.append(edh_deck)

        # Create an instance of a MoxfieldUser and return the response as JSON
        moxfield_user = MoxFieldUser(
            username=user_deck_list_response[0]['createdByUser']['displayName'],
            profile_picture=user_deck_list_response[0]['createdByUser'].get('profileImageUrl', ""),
            edh_decks=deck_cards_list
        )

        # Show Combos/ Potential Combos for Each Deck by requesting all the combos from CommanderSpellBookAgent
        # this will add on all the found combos to the EDHDeckList instances on the moxfield_user
        time_function(CommanderSpellBookAgent.find_combos_in_moxfield_user_decks, moxfield_user=moxfield_user)
        # TODO: Show Top Recommended Cards to add to get combos across all decks
        return JsonResponse(dict(
            moxfield_user=moxfield_user.to_json(),
            top_ten_cards=[card.to_json() for card in moxfield_user.get_top_ten_cards(include_lands=include_lands)],
            average_lands=moxfield_user.get_average_land_count(),
            average_cmc=moxfield_user.get_average_cmc_across_all_decks()
        ))


def get_card_scryfall_info(request):
    if request.method == "POST":
        # Get the list of cards to find from the request body
        data = json.loads(request.body)
        cards_to_find_list = data.get('cards_to_find', [])

        # Create an instance of the Scryfall agent, so we can request the card info
        scryfall_agent = ScryfallAgent()

        # Build a list of all the found card info from Scryfall
        found_cards_list = []
        for card_info in cards_to_find_list:
            found_cards_list.append(
                scryfall_agent.get_card_information(card_name=card_info[0], count=card_info[1]).to_json()
            )

        # Return the response of all the cards info
        return JsonResponse(dict(
            found_cards=found_cards_list
        ))
