from rest_framework import serializers
from .models import Bookings, Vehicle, Driver

class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"

class BookingSerializer(serializers.ModelSerializer):
    vehicle_type = serializers.CharField(
        source='vehicle.vehicle_type',
        read_only=True
    )

    vehicle_number = serializers.CharField(
        source='vehicle.vehicle_number',
        read_only=True
    )

    class Meta:
        model = Bookings
        fields = "__all__"