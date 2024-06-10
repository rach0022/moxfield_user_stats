from django.urls import path
from user_stats_app.views import home

moxfield_user_stats_urls = [
    path('', home, name="user_home")
]
