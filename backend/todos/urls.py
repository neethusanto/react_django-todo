from django.urls import path
from . import views

urlpatterns = [
    path("health/", views.health),
    path("todos/", views.todo_list),
    path("todos/<int:todo_id>/", views.todo_detail),
]
