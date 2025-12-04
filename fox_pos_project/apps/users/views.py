from django.contrib.auth.views import LoginView, LogoutView
from .forms import LoginForm

class CustomLoginView(LoginView):
    template_name = 'users/login.html'
    form_class = LoginForm
    redirect_authenticated_user = True

class CustomLogoutView(LogoutView):
    next_page = 'users:login'
