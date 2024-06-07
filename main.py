from core import MoxFieldAgent, EDHDeckList, MagicDeckList


def download_edh_deck_list():
    # First connect to the moxfield API and get all the user decks
    user_name = str(input("What is the username from Moxfield that you are checking?:\n"))
    moxfield_agent = MoxFieldAgent(user_name)
    user_deck_list_response = moxfield_agent.get_user_decks()

    # Transform the response into EDHDeckList objects
    user_deck_list = []
    for edh_deck in user_deck_list_response:
        user_deck_list.append(MagicDeckList.from_json(edh_deck))

    # Now with each MagicDeckList we can load the actual deck-lists from moxfield
    deck_cards_list = []
    for deck in user_deck_list:
        json_deck_list_response = moxfield_agent.get_deck_list(deck.id)
        json_deck_list_response.update(deck.__dict__)
        deck_cards_list.append(EDHDeckList.from_json(json_deck_list_response))

    # For now print out the stats of each deck while testing
    for validated_deck in deck_cards_list:
        print(validated_deck)

    # TODO: Find out how to get the exact quantities of each card


if __name__ == '__main__':
    download_edh_deck_list()
