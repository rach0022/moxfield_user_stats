import json

from django.http import JsonResponse
from django.shortcuts import render
from user_stats_app.core import MoxFieldAgent, MagicDeckList, EDHDeckList, MoxFieldUser


def home(request):
    return render(request, 'user_stats_app/user_decks.html')


def search_user_decks(request):
    if request.method == "POST":
        # First connect to the moxfield API and get all the user decks
        data = json.loads(request.body)
        user_name = data.get('user_name')
        include_lands = data.get('include_lands')
        moxfield_agent = MoxFieldAgent(user_name)
        user_deck_list_response = moxfield_agent.get_user_decks()

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

        return JsonResponse(dict(
            moxfield_user=moxfield_user.to_json(),
            top_ten_cards=[card.to_json() for card in moxfield_user.get_top_ten_cards(include_lands=include_lands)],
            average_lands=moxfield_user.get_average_land_count(),
            average_cmc=moxfield_user.get_average_cmc_across_all_decks()
        ))
