import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .models import Todo

def health(request):
    return JsonResponse({"status": "ok", "service": "Django API"})

def serialize(todo):
    return {
        "id": todo.id,
        "title": todo.title,
        "completed": todo.completed,
        "created_at": todo.created_at.isoformat(),
    }

@csrf_exempt
@require_http_methods(["GET", "POST"])
def todo_list(request):
    if request.method == "GET":
        return JsonResponse([serialize(t) for t in Todo.objects.all()], safe=False)

    try:
        data = json.loads(request.body or "{}")
        title = str(data.get("title", "")).strip()
        if not title:
            return JsonResponse({"error": "Title is required."}, status=400)
        if len(title) > 200:
            return JsonResponse({"error": "Title must be 200 characters or fewer."}, status=400)
        todo = Todo.objects.create(title=title)
        return JsonResponse(serialize(todo), status=201)
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"error": "Invalid JSON."}, status=400)

@csrf_exempt
@require_http_methods(["PATCH", "DELETE"])
def todo_detail(request, todo_id):
    try:
        todo = Todo.objects.get(id=todo_id)
    except Todo.DoesNotExist:
        return JsonResponse({"error": "Todo not found."}, status=404)

    if request.method == "DELETE":
        todo.delete()
        return JsonResponse({"message": "Deleted."})

    try:
        data = json.loads(request.body or "{}")
        if "completed" in data:
            todo.completed = bool(data["completed"])
        if "title" in data:
            title = str(data["title"]).strip()
            if not title or len(title) > 200:
                return JsonResponse({"error": "Title must contain 1–200 characters."}, status=400)
            todo.title = title
        todo.save()
        return JsonResponse(serialize(todo))
    except (json.JSONDecodeError, TypeError):
        return JsonResponse({"error": "Invalid JSON."}, status=400)
