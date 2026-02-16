from rest_framework import serializers
from .models import Bookings, Vehicle, Driver, DriverTripReport


class VehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    class Meta:
        model = Driver
        fields = "__all__"

class BookingSerializer(serializers.ModelSerializer):
    vehicle_type = serializers.CharField(source='vehicle.vehicle_type', read_only=True)
    vehicle_number = serializers.CharField(source='vehicle.vehicle_number', read_only=True)
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    contact_number = serializers.CharField(source='driver.contact_number', read_only=True)

    class Meta:
        model = Bookings
        fields = "__all__"

    def update(self, instance, validated_data):
        old_status = instance.status
        old_driver = instance.driver_id
        old_vehicle = instance.vehicle_id

        instance = super().update(instance, validated_data)

        new_status = instance.status

        # STATUS → COMPLETED or CANCELLED
        if old_status != new_status and new_status in ["completed", "cancelled"]:
            Driver.objects.filter(id=old_driver).update(driver_status="available")
            Vehicle.objects.filter(id=old_vehicle).update(vehicle_status="available")

        # STATUS → CONFIRMED
        if old_status != new_status and new_status == "confirmed":
            Driver.objects.filter(id=instance.driver_id).update(driver_status="booked")
            Vehicle.objects.filter(id=instance.vehicle_id).update(vehicle_status="booked")

        # DRIVER CHANGED
        if old_driver != instance.driver_id:
            Driver.objects.filter(id=old_driver).update(driver_status="available")
            Driver.objects.filter(id=instance.driver_id).update(driver_status="booked")

        # VEHICLE CHANGED
        if old_vehicle != instance.vehicle_id:
            Vehicle.objects.filter(id=old_vehicle).update(vehicle_status="available")
            Vehicle.objects.filter(id=instance.vehicle_id).update(vehicle_status="booked")

        return instance


class DriverTripReportSerializer(serializers.ModelSerializer):
    driver_name = serializers.CharField(source="driver.name", read_only=True)
    booking_code = serializers.CharField(source="booking.booking_id", read_only=True)

    class Meta:
        model = DriverTripReport
        fields = "__all__"
