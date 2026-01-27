from django.urls import path
from .views import vehicle_list_create, vehicle_detail
urlpatterns = [
    # path('login/', login_view, name='login'),
    path('vehicles/', vehicle_list_create,name='vehicle_list_create'),
    path('vehicles/<int:pk>/', vehicle_detail,name='vehicle_detail'),
]
