from django.urls import path
from . import views

app_name = 'treasury'

urlpatterns = [
    path('', views.treasury_list, name='treasury_list'),
    path('create/', views.treasury_create, name='treasury_create'),
]
