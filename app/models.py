from django.db import models
from django.utils import timezone

class ExchangeRate(models.Model):
    date = models.DateField()
    rate = models.FloatField()
    currency_pair = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']
        get_latest_by = 'date'

    def __str__(self):
        return f"{self.currency_pair} - {self.date}: {self.rate}"