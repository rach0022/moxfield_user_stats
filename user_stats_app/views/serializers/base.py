from rest_framework import serializers


class HealthCheckSerializer(serializers.Serializer):
    database_healthy = serializers.BooleanField()
    success = serializers.CharField()
    error = serializers.CharField()

    def to_representation(self, instance):
        return {
            'database': instance.get('database'),
            'success': instance.get('success'),
            'error': instance.get('error')
        }
