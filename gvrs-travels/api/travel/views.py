from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .serializers import LoginSerializer
from .services.whatsapp_service import send_whatsapp_message
from datetime import datetime

@api_view(['POST'])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        return Response(
            {"message": "Login successful"},
            status=status.HTTP_200_OK
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def generate_booking_id():
    year = datetime.now().year
    timestamp = int(datetime.now().timestamp())
    return f"GVRS-{year}-{timestamp}"

@api_view(["POST"])
def create_booking(request):
    data = request.data

    booking_id = generate_booking_id()

    customer_message = f"""
✅ Booking Confirmed
Booking ID: {booking_id}

Customer: {data['customerName']}
Pickup: {data['pickup']}
Drop: {data['drop']}

Driver:
{data['driverName']}
{data['driverPhone']}

GVRS Travels
"""

    driver_message = f"""
🚘 New Trip Assigned

Booking ID: {booking_id}

Customer:
{data['customerName']}
{data['customerPhone']}

Pickup: {data['pickup']}
Drop: {data['drop']}

GVRS Travels
"""

    send_whatsapp_message(data["customerPhone"], customer_message)
    send_whatsapp_message(data["driverPhone"], driver_message)

    return Response({
        "success": True,
        "bookingId": booking_id
    })
