import heapq
import random
import time
from datetime import timedelta

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


def format_timedelta(delta):
    total_seconds = delta.total_seconds()
    hours, remainder = divmod(total_seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    milliseconds = delta.microseconds / 1000
    return f"{int(hours):02}:{int(minutes):02}:{int(seconds):02}:{int(milliseconds):03}"


def time_function(func, *args, **kwargs):
    """Function that is used to time the inner function and return's the result from the inner function and will print
    out the time it took for this function to run"""
    start_time = time.perf_counter()
    result = func(*args, **kwargs)
    end_time = time.perf_counter()
    elapsed_time = timedelta(seconds=end_time - start_time)
    print(f"Time taken by {func.__name__}: {format_timedelta(elapsed_time)}")
    return result
