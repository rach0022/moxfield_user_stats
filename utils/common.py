import heapq
import random

from utils.constants import USER_AGENTS


def get_random_user_agent():
    return random.choice(USER_AGENTS)


def get_n_largest_items_from_count_dict(count_dict: dict, num_items: int = 10):
    """Get the N Largest Items from a dictionary object full of the counts of objects."""
    return heapq.nlargest(num_items, count_dict.items(), key=lambda x: x[1])


def increment_count_dict(key, count_dict, increment_amount):
    if key in count_dict:
        count_dict[key] += increment_amount
    else:
        count_dict[key] = increment_amount


def to_magic_cards(raw_cards: dict | list = None, scryfall_response: dict = None):
    from user_stats_app.core.core import MagicCard

    if isinstance(raw_cards, list):
        return [MagicCard.from_json(card_data['name'], card_data) for card_data in raw_cards]
    # If raw data for cards is given as a dict object with they key as the card name and the value as the attributes
    if scryfall_response:
        return MagicCard.from_json(scryfall_response=scryfall_response)
    return [MagicCard.from_json(card_name, attributes) for card_name, attributes in raw_cards.items()]
