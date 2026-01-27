from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Vehicle
from .serializers import VehicleSerializer


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


@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def vehicle_detail(request, pk):
    """
    GET    → Retrieve vehicle
    POST   → Create vehicle
    PUT    → Update vehicle
    DELETE → Delete vehicle
    """
    try:
        vehicle = Vehicle.objects.get(pk=pk)
    except Vehicle.DoesNotExist:
        return Response({"error": "Vehicle not found"}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        print('@'*80,request.data)
        serializer = VehicleSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        serializer = VehicleSerializer(vehicle)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = VehicleSerializer(vehicle, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        vehicle.delete()
        return Response({"message": "Vehicle deleted successfully"})
