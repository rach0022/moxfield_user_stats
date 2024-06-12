from django.urls import path
from user_stats_app.views import home, search_user_decks, get_card_scryfall_info

moxfield_user_stats_urls = [
    path('', home, name="user_home"),
    path('search', search_user_decks, name="search_moxfield_user_decks"),
    path('get_card_scryfall_info', get_card_scryfall_info, name="get_card_scryfall_info")
]
