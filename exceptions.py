import requests.exceptions


# TODO: Create Executions for Different API Calls like User Not Found, Card Not Found, Etc
class UserNotFoundException(requests.exceptions.HTTPError):
    username: str

    def __init__(self, message="", errors=BaseException(), username=""):
        super().__init__(message)
        self.message = message
        self.errors = errors
        self.username = username

    def __str__(self):
        return f"-- The User: {self.username} was not found on MoxField, Exiting Early...{self.message}"


class ScryfallCardNotFoundException(requests.exceptions.HTTPError):
    card_name: str

    def __init__(self, message="", errors=BaseException(), card_name=""):
        super().__init__(message)
        self.message = message
        self.errors = errors
        self.card_name = card_name

    def __str__(self):
        return f"-- The Card: {self.card_name} was not found on Scryfall. {self.message}"
