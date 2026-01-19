from django.db import models

# Create your models here.
class BookingCounter(models.Model):
    year = models.IntegerField(unique=True)
    counter = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.year} - {self.counter}"
