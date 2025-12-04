from django.urls import path
from . import views

app_name = 'inventory'

urlpatterns = [
    path('', views.movement_list, name='movement_list'),
]
