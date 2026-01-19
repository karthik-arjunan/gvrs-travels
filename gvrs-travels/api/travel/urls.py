from django.urls import path
from .views import login_view, create_booking

urlpatterns = [
    path('login/', login_view, name='login'),
    path("create-booking/", create_booking , name='create_booking'),
]
