from django.shortcuts import render
from rest_framework.decorators import api_view
from django.http import JsonResponse, Http404
from rest_framework import status
from rest_framework.views import APIView
from django.db import connection
from django.db.utils import OperationalError

from user_stats_app.views.serializers import HealthCheckSerializer


class HealthCheckController(APIView):
    def get(self, request):
        """Return the Health Status Check for the API, this is to determine if the application is running from the f
        front-end. We can achieve this by confirming our database connection and sending the results"""

        # Set up a dict to hold the value of the response from the database connection
        response = dict()

        # If the database connection is valid, we can send a health status check
        try:
            connection.ensure_connection()
            response['database_healthy'] = True
            response['success'] = "The Django Webserver for the Moxfield User Stats Application is Online"
            response_status = status.HTTP_200_OK
        except OperationalError:
            response['database_healthy'] = False
            response['error'] = "The Django Webserver is offline."
            response_status = status.HTTP_500_INTERNAL_SERVER_ERROR

        # If the serialized response is valid, send the health check status from the api, otherwise send the errors
        serialized_response = HealthCheckSerializer(data=response)
        if serialized_response.is_valid():
            return JsonResponse(
                data=serialized_response.data, status=response_status
            )

        return JsonResponse(data=serialized_response.errors, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
