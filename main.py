from core import MoxFieldAgent, EDHDeckList, MagicDeckList, MoxFieldUser


def download_edh_deck_list():
    # First connect to the moxfield API and get all the user decks
    user_name = str(input("What is the username from Moxfield that you are checking?:\n"))
    moxfield_agent = MoxFieldAgent(user_name)
    user_deck_list_response = moxfield_agent.get_user_decks()
    username = user_deck_list_response[0]['createdByUser']['displayName']

    # Transform the response into EDHDeckList objects
    user_deck_list = []
    for edh_deck in user_deck_list_response:
        if edh_deck['format'] == "commander":
            user_deck_list.append(MagicDeckList.from_json(edh_deck))

    print(f"\nUser {username} has {len(user_deck_list)} Magic the Gathering Decks for EDH:")

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

    # For now print out the stats of each deck while testing
    for validated_deck in deck_cards_list:
        print("--", validated_deck)

    return deck_cards_list, user_deck_list_response


def generate_user_statistics():
    edh_decks, moxfield_user_deck_list_response = download_edh_deck_list()
    moxfield_user = MoxFieldUser(
        username=moxfield_user_deck_list_response[0]['createdByUser']['displayName'],
        profile_picture=moxfield_user_deck_list_response[0]['createdByUser'].get('profileImageUrl', ""),
        edh_decks=edh_decks
    )
    # TODO: Now output the stats from the decks, average cmc of decks, average land count, etc
    print(f"\n User Statistics for {moxfield_user.username}:")
    top_10_cards = moxfield_user.get_top_ten_cards()

    print(f"-- Top 10 Cards for {moxfield_user.username}:")
    for card, value in top_10_cards:
        print(f"---- {card} ({value})")


if __name__ == '__main__':
    generate_user_statistics()
