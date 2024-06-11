from dataclasses import dataclass, field
from datetime import datetime
from typing import List

from utils import COLOUR_NAMES, get_n_largest_items_from_count_dict, increment_count_dict, to_magic_cards


@dataclass
class MagicCard:
    id: str
    name: str
    quantity: int
    is_foil: bool
    converted_mana_cost: float = 0
    moxfield_id: str = ""
    type: str = ""
    image_url: str = ""

    @property
    def is_land(self) -> bool:
        return "Land" in self.type

    def to_json(self):
        return dict(
            id=self.id,
            name=self.name,
            quantity=self.quantity,
            is_foil=self.is_foil,
            converted_mana_cost=self.converted_mana_cost,
            moxfield_id=self.moxfield_id,
            type=self.type,
            image_url=self.image_url
        )

    @staticmethod
    def from_json(card_name: str = "", attr=None, scryfall_response=None):
        if attr is None:
            attr = dict()
        try:
            if not scryfall_response:
                # Build the moxfield ID to use for the image url mainly
                moxfield_id = attr['id'] if "id" in attr else attr['card']['id']
                image_url = f"https://assets.moxfield.net/cards/card-{moxfield_id}-art_crop.webp"

                # If we have multiple card faces then we can set the moxfield id to the id of the front face
                if 'card' in attr:
                    if len(attr['card']['card_faces']) > 0:
                        moxfield_id = attr['card']['card_faces'][0]['id']
                        image_url = f"https://assets.moxfield.net/cards/card-face-{moxfield_id}-art_crop.webp"

                # Finally return the magic card object
                return MagicCard(
                    id=attr['scryfall_id'] if "scryfall_id" in attr else attr['card']['scryfall_id'],
                    moxfield_id=moxfield_id,
                    name=card_name,
                    quantity=attr['quantity'] if "quantity" in attr else 1,
                    is_foil=attr['isFoil'] if "isFoil" in attr else False,
                    converted_mana_cost=attr['card'].get('cmc', 0) if "card" in attr else attr.get("cmc", 0),
                    type=attr['card'].get('type_line', "") if "card" in attr else attr.get("type_line", ""),
                    image_url=image_url
                )
            return MagicCard(
                id=scryfall_response['id'],
                name=scryfall_response['name'],
                quantity=scryfall_response['quantity'] if "quantity" in scryfall_response else 1,
                is_foil=scryfall_response['foil'],
                converted_mana_cost=scryfall_response['cmc'],
                type=scryfall_response['type_line'],
            )
        except KeyError as key_error:
            print("key error with card", card_name, attr, key_error)


@dataclass
class MagicDeckList:
    colour_identity: List[str] = field(default_factory=lambda: [])
    id: str = ""
    name: str = ""
    format: str = ""
    url: str = ""
    is_legal: bool = False

    @staticmethod
    def from_json(json_response):
        return MagicDeckList(
            id=json_response["publicId"],
            name=json_response["name"],
            colour_identity=json_response["colorIdentity"],
            url=json_response['publicUrl'],
            is_legal=json_response['isLegal']
        )


@dataclass
class EDHDeckList(MagicDeckList):
    name: str = ""
    is_legal: bool = False
    main_board: List[MagicCard] = field(default_factory=lambda: [])
    commanders: List[MagicCard] = field(default_factory=lambda: [])
    companions: List[MagicCard] = field(default_factory=lambda: [])
    side_board: List[MagicCard] = field(default_factory=lambda: [])
    maybe_board: List[MagicCard] = field(default_factory=lambda: [])
    tokens: List[MagicCard] = field(default_factory=lambda: [])
    combos_found: List[dict] = field(default_factory=lambda: [])
    potential_combos: List[dict] = field(default_factory=lambda: [])
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()

    def get_average_mana_cost(self):
        """Get the average mana cost of the deck without lands"""
        total_mana_cost = self.get_total_mana_cost()
        total_lands = self.get_land_count()
        total_cards_in_deck = self.get_deck_size()
        return total_mana_cost / (total_cards_in_deck - total_lands)

    def get_deck_size(self):
        """Get the total number of cards in the Deck, for legal EDh decks it should be 100"""
        total_cards_in_deck = sum(card.quantity for card in self.main_board)
        total_cards_in_deck += sum(card.quantity for card in self.commanders)
        total_cards_in_deck += sum(card.quantity for card in self.companions)
        return total_cards_in_deck

    def get_total_mana_cost(self):
        """Get the total cost (CMC) of all cards in the deck"""
        total_mana_cost = sum(card.converted_mana_cost for card in self.main_board if not card.is_land)
        total_mana_cost += sum(commander.converted_mana_cost for commander in self.commanders)
        return total_mana_cost

    def get_land_count(self):
        return sum(card.quantity for card in list(filter(lambda card: card.is_land, self.main_board)))

    def get_card_names(self):
        card_names = [card.name for card in self.commanders]
        card_names.extend([card.name for card in self.companions])
        card_names.extend([card.name for card in self.main_board])
        return card_names

    def to_json(self):
        return dict(
            name=self.name,
            is_legal=self.is_legal,
            main_board=[main.__dict__ for main in self.main_board],
            commanders=[commander.__dict__ for commander in self.commanders],
            companions=[companion.__dict__ for companion in self.companions],
            side_board=[side.__dict__ for side in self.side_board],
            maybe_board=[maybe.__dict__ for maybe in self.maybe_board],
            tokens=[token.__dict__ for token in self.tokens],
            combos_found=self.combos_found,
            potential_combos=self.potential_combos,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )

    @staticmethod
    def from_json(json_response):
        # First get a list of the commanders in the deck:
        return EDHDeckList(
            id=json_response["id"],
            name=json_response["name"],
            is_legal=json_response['is_legal'],
            colour_identity=json_response["colour_identity"],
            url=json_response['url'],
            commanders=to_magic_cards(json_response['commanders']),
            companions=to_magic_cards(json_response["companions"]),
            main_board=to_magic_cards(json_response["mainboard"]),
            side_board=to_magic_cards(json_response["sideboard"]),
            tokens=to_magic_cards(json_response['tokens']),
            created_at=json_response['createdAtUtc'],
            updated_at=json_response['lastUpdatedAtUtc']
        )

    def __str__(self):
        main_board_count = sum([card.quantity for card in self.main_board])
        colour_identity = COLOUR_NAMES[''.join(self.colour_identity)]
        commanders = ','.join([str(commander.name) for commander in self.commanders])
        return f"{self.name} (Commander: {commanders}) | MainBoard: {main_board_count} | CI: {colour_identity} | Average CMC: {self.get_average_mana_cost()}"


@dataclass
class MoxFieldUser:
    username: str = ""
    profile_picture: str = ""
    edh_decks: List[EDHDeckList] = field(default_factory=lambda: [])

    def get_card_counts(self, include_lands=True):
        """Get the counts for each card in every deck"""

        # Set up a dict to track each card by the name as the key and the count as the value
        card_counts_dict = dict()
        for deck in self.edh_decks:
            for commander in deck.commanders:
                # If we find the Commander name in the dict then increment the value or initialize it to 1
                increment_count_dict(
                    key=commander.name, count_dict=card_counts_dict, increment_amount=commander.quantity
                )

            for card in deck.main_board:
                # If we are not including lands, and we find a land card then skip this loop iteration
                if not include_lands and card.is_land:
                    continue

                # If we find the Card name in the dict then increment the value or initialize it to 1
                increment_count_dict(key=card.name, count_dict=card_counts_dict, increment_amount=card.quantity)

        return card_counts_dict

    def get_average_land_count(self):
        """Get the average amount of lands used across all the EDH decks"""
        # First get the total number of lands from the decks
        total_land_count = sum([deck.get_land_count() for deck in self.edh_decks])

        # Divide the total number of lands by the number of decks and return the value
        return total_land_count / len(self.edh_decks)

    def get_top_ten_cards(self, include_lands=False):
        # First get the card counts from all the decks and ignore any lands (by default)
        deck_card_counts = self.get_card_counts(include_lands=include_lands)

        # Using heapq nlargest function we can get the 10 largest items from this dict
        top_ten_cards = get_n_largest_items_from_count_dict(deck_card_counts, 10)
        top_ten_cards_list = []

        for (card, count) in top_ten_cards:
            # Find the magic card by name and return the MagicCard Instance
            mtg_card = self.get_card_by_name(card, quantity_override=count)
            if mtg_card:
                top_ten_cards_list.append(mtg_card)

        return top_ten_cards_list

    def get_card_by_name(self, card_name: str, quantity_override=None) -> MagicCard | None:
        """Find a MagicCard by name from the user's decks."""
        for deck in self.edh_decks:
            all_cards = [
                *deck.main_board, *deck.commanders, *deck.companions, *deck.side_board,
                *deck.maybe_board, *deck.tokens
            ]
            for card in all_cards:
                if card.name == card_name:
                    # If we supplied a quantity_override use that instead of the found cards value
                    if quantity_override:
                        updated_card = card
                        updated_card.quantity = quantity_override
                        return updated_card
                    return card
        return None

    def get_average_cmc_across_all_decks(self, include_lands=False):
        total_cards_in_decks = sum(deck.get_deck_size() for deck in self.edh_decks)
        total_mana_across_decks = sum(deck.get_total_mana_cost() for deck in self.edh_decks)
        total_land_across_decks = sum(deck.get_land_count() for deck in self.edh_decks)
        denominator = total_cards_in_decks if include_lands else total_cards_in_decks - total_land_across_decks
        return total_mana_across_decks / denominator

    def to_json(self):
        return dict(
            username=self.username,
            profile_picture=self.profile_picture,
            edh_decks=[deck.to_json() for deck in self.edh_decks if len(deck.commanders) > 0]
        )
