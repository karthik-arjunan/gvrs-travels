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
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_status = self.status
        self._original_driver = self.driver_id
        self._original_vehicle = self.vehicle_id
    
    # =============================
    # SAVE LOGIC
    # =============================
    def save(self, *args, **kwargs):
        is_new = self.pk is None

        old_driver_id = None
        old_vehicle_id = None
        old_status = None

        if not is_new:
            old = Bookings.objects.only("driver_id", "vehicle_id", "status").get(pk=self.pk)
            old_driver_id = old.driver_id
            old_vehicle_id = old.vehicle_id
            old_status = old.status

        # ===============================
        # LOCK DRIVER + VEHICLE IF ASSIGNED
        # ===============================
        if self.driver_id and self.vehicle_id:
            Driver.objects.filter(id=self.driver_id).update(driver_status="booked")
            Vehicle.objects.filter(id=self.vehicle_id).update(vehicle_status="booked")

        # ===============================
        # RELEASE IF COMPLETED OR CANCELLED
        # ===============================
        if not is_new and self.status in ["completed", "cancelled"]:
            Driver.objects.filter(id=old_driver_id).update(driver_status="available")
            Vehicle.objects.filter(id=old_vehicle_id).update(vehicle_status="available")

        # ===============================
        # DRIVER CHANGED
        # ===============================
        if not is_new and old_driver_id != self.driver_id:
            Driver.objects.filter(id=old_driver_id).update(driver_status="available")
            Driver.objects.filter(id=self.driver_id).update(driver_status="booked")

        # ===============================
        # VEHICLE CHANGED
        # ===============================
        if not is_new and old_vehicle_id != self.vehicle_id:
            Vehicle.objects.filter(id=old_vehicle_id).update(vehicle_status="available")
            Vehicle.objects.filter(id=self.vehicle_id).update(vehicle_status="booked")

        # ===============================
        # BOOKING ID
        # ===============================
        if not self.booking_id:
            last = Bookings.objects.order_by("-id").first()
            next_num = (last.id + 1) if last else 1
            self.booking_id = f"GVRS-2026-{next_num:03d}"

        super().save(*args, **kwargs)




class DriverTripReport(models.Model):
    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE,
        related_name="trip_reports"
    )

    booking = models.ForeignKey(
        Bookings,
        on_delete=models.CASCADE,
        related_name="driver_reports"
    )

    start_km = models.PositiveIntegerField()
    end_km = models.PositiveIntegerField()
    driven_km = models.PositiveIntegerField()

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # auto calculate driven km (backend safety)
        self.driven_km = self.end_km - self.start_km
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.driver} — {self.driven_km} KM"