import random
from utils.constants import USER_AGENTS


def get_random_user_agent():
    return random.choice(USER_AGENTS)
