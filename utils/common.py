import heapq
import random
from utils.constants import USER_AGENTS


def get_random_user_agent():
    return random.choice(USER_AGENTS)


def get_n_largest_items_from_count_dict(count_dict: dict, num_items: int = 10):
    """Get the N Largest Items from a dictionary object full of the counts of objects."""
    return heapq.nlargest(num_items, count_dict.items(), key=lambda x: x[1])
