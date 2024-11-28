from dataclasses import dataclass

from utils import get_random_user_agent


@dataclass
class BaseAPIAgent:
    @classmethod
    def generate_request_header(cls):
        return {
            'USER-AGENT': get_random_user_agent(),
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
