from django.db import models

# Create your models here.
class Vehicle(models.Model):


    vehicle_type = models.CharField(max_length=20)
    brand = models.CharField(max_length=100)
    model = models.CharField(max_length=100)
    vehicle_number = models.CharField(max_length=20, unique=True)
    seating_capacity = models.IntegerField()
    fuel_type = models.CharField(max_length=50)
    insurance_company = models.CharField(max_length=100)
    insurance_start_date = models.DateField()
    insurance_end_date = models.DateField()
    puc_start_date = models.DateField(null=True, blank=True)
    puc_end_date = models.DateField(null=True, blank=True)
    fc_start_date = models.DateField(null=True, blank=True)
    fc_end_date = models.DateField(null=True, blank=True)
    permit_start_date = models.DateField(null=True, blank=True)
    permit_end_date = models.DateField(null=True, blank=True)
    vehicle_status=models.CharField(max_length=50)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_number} - {self.brand} {self.model}"
    

class Driver(models.Model):
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="drivers/", null=True, blank=True)

    contact_number = models.CharField(max_length=15)
    emergency_contact_number = models.CharField(max_length=15)

    license_number = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField()

    father_or_spouse_name = models.CharField(max_length=100)
    address = models.TextField()
    driver_status = models.CharField(max_length=25)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.license_number}"


class Booking(models.Model):

    booking_id = models.CharField(max_length=30, unique=True)

    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15)

    pickup_location = models.CharField(max_length=150)
    drop_location = models.CharField(max_length=150)

    driver_name = models.CharField(max_length=100)
    driver_phone = models.CharField(max_length=15)

    pickup_datetime = models.DateTimeField()
    drop_date = models.DateField()

    vehicle_type = models.CharField(max_length=10)

    vehicle_number = models.CharField(max_length=30)

    amount = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(max_length=20)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_id

