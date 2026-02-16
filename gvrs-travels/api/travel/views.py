from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework import status
from .models import (Bookings, Vehicle, 
                     Driver,DriverTripReport)
from .serializers import (BookingSerializer, 
                          VehicleSerializer, DriverSerializer,
                          DriverTripReportSerializer)


@api_view(['GET', 'POST'])
def vehicle_list_create(request):
    """
    GET  → List all vehicles
    POST → Create new vehicle
    """
    if request.method == 'GET':
        vehicles = Vehicle.objects.all().order_by('-id')
        serializer = VehicleSerializer(vehicles, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'PATCH', 'DELETE'])
def vehicle_detail(request, pk):
    """
    GET    → Retrieve vehicle
    POST   → Create vehicle
    PUT    → Update vehicle
    PATCH  → Partially update vehicle
    DELETE → Delete vehicle
    """
    try:
        vehicle = Vehicle.objects.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = VehicleSerializer(vehicle, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'PATCH':
        serializer = VehicleSerializer(
            vehicle,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        vehicle.delete()
        return Response({"message": "Vehicle deleted successfully"})


@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser])
def driver_list_create(request):
    """
    GET  → List all drivers
    POST → Create new driver
    """
    if request.method == 'GET':
        drivers = Driver.objects.all().order_by('-id')
        serializer = DriverSerializer(drivers, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = DriverSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@parser_classes([MultiPartParser, FormParser])
def driver_detail(request, pk):
    """
    GET    → Retrieve driver
    PUT    → Update driver
    PATCH  → Partially update driver
    DELETE → Delete driver
    """
    try:
        driver = Driver.objects.get(pk=pk)
    except Driver.DoesNotExist:
        return Response({"error": "Driver not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = DriverSerializer(driver)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = DriverSerializer(driver, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PATCH':
        serializer = DriverSerializer(
            driver,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        driver.delete()
        return Response({"message": "Driver deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    

@api_view(['GET', 'POST'])
def bookings_list_create(request):
    if request.method == 'GET':
        bookings = Bookings.objects.all().order_by('-id')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = BookingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
def booking_detail(request, pk):
    try:
        booking = Bookings.objects.get(pk=pk)
    except Bookings.DoesNotExist:
        return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = BookingSerializer(booking)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = BookingSerializer(booking, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        booking.delete()
        return Response({"message": "Booking deleted successfully"}, status=status.HTTP_204_NO_CONTENT)
    
@api_view(["POST"])
def create_driver_report(request):
    serializer = DriverTripReportSerializer(data=request.data)

    if serializer.is_valid():
        report = serializer.save()
        return Response(
            DriverTripReportSerializer(report).data,
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
def list_driver_reports(request):
    reports = DriverTripReport.objects.select_related(
        "driver", "booking"
    ).order_by("-created_at")

    serializer = DriverTripReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def reports_by_driver(request, driver_id):
    reports = DriverTripReport.objects.filter(
        driver_id=driver_id
    ).select_related("driver", "booking")

    serializer = DriverTripReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(["DELETE"])
def delete_driver_report(request, pk):
    try:
        report = DriverTripReport.objects.get(pk=pk)
        report.delete()
        return Response({"message": "Deleted"})
    except DriverTripReport.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
