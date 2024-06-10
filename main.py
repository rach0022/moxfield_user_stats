from typing import List

from core import MoxFieldAgent, EDHDeckList, MagicDeckList, MoxFieldUser
from core.api.commander_spell_book import CommanderSpellBookAgent


def generate_moxfield_user():
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

    return MoxFieldUser(
        username=user_deck_list_response[0]['createdByUser']['displayName'],
        profile_picture=user_deck_list_response[0]['createdByUser'].get('profileImageUrl', ""),
        edh_decks=deck_cards_list
    )


def find_combos_in_moxfield_user_decks(moxfield_user: MoxFieldUser) -> CommanderSpellBookAgent:
    """Create an instance of the CommanderSpellBook Agent and find all the user combos and return"""
    commander_spell_book_agent = CommanderSpellBookAgent(moxfield_user)
    commander_spell_book_agent.get_all_user_deck_combos()
    return commander_spell_book_agent


def generate_moxfield_user_statistics():
    """After generating a MoxFieldUser we can output the stats for average cmc, average land count, and more from across
    all the edh decks."""
    moxfield_user = generate_moxfield_user()
    print(f"\n User Statistics for {moxfield_user.username}:")
    top_10_cards = moxfield_user.get_top_ten_cards(include_lands=False)

    # Show the stats for the top ten cards including their ranks
    print(f"-- Top 10 Cards for {moxfield_user.username}:")
    for counter, (card, value) in enumerate(top_10_cards):
        print(f"---- Rank {counter + 1}. {card} ({value})")

    # Output the stats for average number of lands across all decks the average CMC
    print(f"-- AVG # Of Lands Across {len(moxfield_user.edh_decks)} Decks: {moxfield_user.get_average_land_count()}")
    print(f"-- AVG CMC Across {len(moxfield_user.edh_decks)} Decks: {moxfield_user.get_average_cmc_across_all_decks()}")

    # Now get all the user combos and output the number of combos in each deck
    find_combos_in_moxfield_user_decks(moxfield_user=moxfield_user)
    decks_with_combos = [deck for deck in moxfield_user.edh_decks if len(deck.combos_found) > 0]
    decks_with_potential_combos = [deck for deck in moxfield_user.edh_decks if len(deck.potential_combos) > 0]

    # Output the stats about the combos found across all the users decks
    print(f"-- Combos Were Found in the Following {len(decks_with_combos)} Decks: ")
    for deck in decks_with_combos:
        if len(deck.combos_found) > 0:
            print(f"---- {deck.name} Has {len(deck.combos_found)} Combos Detected")

    # Output the stats about all the potential combos found across all the users decks
    print(f"-- Potential Combos Were Found in the Following {len(decks_with_potential_combos)} Decks: ")
    for deck in decks_with_potential_combos:
        if len(deck.potential_combos) > 0:
            print(f"---- {deck.name} Has {len(deck.potential_combos)} Potential Combos Detected")

    # TODO: Output stats about cards needed to make combos in decks and show top 5 cards to add for combos
    for deck in decks_with_potential_combos[0:1]:
        for combo in deck.potential_combos:
            # Create a list out the names for the cards in the combos and print the cards not in the deck
            cards_required_list = [card['card']['name'] for card in combo['uses']]
            print(','.join(card for card in cards_required_list if card not in deck.get_card_names()))


if __name__ == '__main__':
    generate_moxfield_user_statistics()
