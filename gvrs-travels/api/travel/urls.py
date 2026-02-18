from django.urls import path
from .views import (vehicle_list_create, vehicle_detail, driver_list_create, 
                    driver_detail,bookings_list_create,booking_detail,create_driver_report,
                    list_driver_reports,reports_by_driver,delete_driver_report,
                    list_trip_finance, create_trip_finance)

urlpatterns = [
    # path('login/', login_view, name='login'),
    path('vehicles/', vehicle_list_create,name='vehicle_list_create'),
    path('vehicles/<int:pk>/', vehicle_detail,name='vehicle_detail'),
    path("drivers/", driver_list_create, name="driver-list-create"),
    path("drivers/<int:pk>/", driver_detail, name="driver-detail"),
    path('bookings/', bookings_list_create, name='bookings_list_create'),
    path('bookings/<int:pk>/', booking_detail, name='booking_detail'),
    path("reports/", list_driver_reports),
    path("reports/create/", create_driver_report),
    path("reports/driver/<int:driver_id>/", reports_by_driver),
    path("reports/delete/<int:pk>/", delete_driver_report),
    path("trip-finance/", list_trip_finance),
    path("trip-finance/create/", create_trip_finance),
]
