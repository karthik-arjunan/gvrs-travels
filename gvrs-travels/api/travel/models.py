from django.db import models

# Create your models here.
class Vehicle(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("booked", "Booked"),
        ("maintenance", "Maintenance")
    ]
    
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
    vehicle_status=models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.vehicle_number} - {self.brand} {self.model}"
    

class Driver(models.Model):
    STATUS_CHOICES = [
        ("available", "Available"),
        ("booked", "Booked"),
    ]
    name = models.CharField(max_length=100)
    photo = models.ImageField(upload_to="drivers/", null=True, blank=True)
    contact_number = models.CharField(max_length=15)
    emergency_contact_number = models.CharField(max_length=15)
    license_number = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField()
    father_or_spouse_name = models.CharField(max_length=100)
    address = models.TextField()
    driver_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.license_number}"


class Bookings(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]
    booking_id = models.CharField(max_length=30, unique=True, editable=False)
    driver = models.ForeignKey(Driver, on_delete=models.PROTECT)
    vehicle = models.ForeignKey(Vehicle, on_delete=models.PROTECT)
    customer_name = models.CharField(max_length=100)
    customer_phone = models.CharField(max_length=15)
    pickup_location = models.CharField(max_length=150)
    drop_location = models.CharField(max_length=150)
    pickup_datetime = models.DateTimeField()
    drop_date = models.DateField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.booking_id
    
    def save(self, *args, **kwargs):
        if not self.booking_id:
            last = Bookings.objects.count() + 1
            self.booking_id = f"GVRS-2026-{last:03d}"
        super().save(*args, **kwargs)

