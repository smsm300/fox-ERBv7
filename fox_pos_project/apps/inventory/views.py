from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from .models import InventoryMovement

@login_required
def movement_list(request):
    movements = InventoryMovement.objects.all().order_by('-movement_date')
    return render(request, 'inventory/movement_list.html', {'movements': movements})
