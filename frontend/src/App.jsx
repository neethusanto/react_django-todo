import { useEffect, useState } from "react";

const API = "/api/todos/";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTodos() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(API);
      if (!response.ok) throw new Error("Could not load tasks.");
      setTodos(await response.json());
    } catch {
      setError("Could not connect to Django. Check that Docker services are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTodos(); }, []);

  async function addTodo(event) {
    event.preventDefault();
    if (!title.trim()) return;
    setError("");
    try {
      const response = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not add task.");
      setTodos([data, ...todos]);
      setTitle("");
    } catch (e) {
      setError(e.message || "Could not add task.");
    }
  }

  async function toggleTodo(todo) {
    try {
      const response = await fetch(`${API}${todo.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (!response.ok) throw new Error();
      const updated = await response.json();
      setTodos(todos.map(t => t.id === updated.id ? updated : t));
    } catch {
      setError("Could not update task.");
    }
  }

  async function deleteTodo(id) {
    try {
      const response = await fetch(`${API}${id}/`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setTodos(todos.filter(t => t.id !== id));
    } catch {
      setError("Could not delete task.");
    }
  }

  const completed = todos.filter(t => t.completed).length;

  return (
    <main className="page">
      <section className="app-card">
        <div className="eyebrow">REACTJS + DJANGO + DOCKER</div>
        <h1>My Todo List</h1>
        <p className="subtitle">A simple full-stack deployment demo.</p>

        <form onSubmit={addTodo} className="add-form">
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="What do you need to do?" maxLength="200" />
          <button type="submit">Add task</button>
        </form>

        {error && <p className="error" role="alert">{error}</p>}
        <div className="summary">
          <span>{todos.length} tasks</span>
          <span>{completed} completed</span>
        </div>

        {loading ? <p className="empty">Loading tasks…</p> :
          todos.length === 0 ? <p className="empty">No tasks yet. Add your first task above.</p> :
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className={todo.completed ? "done" : ""}>
                <label>
                  <input type="checkbox" checked={todo.completed}
                    onChange={() => toggleTodo(todo)} />
                  <span>{todo.title}</span>
                </label>
                <button className="delete" onClick={() => deleteTodo(todo.id)}
                  aria-label={`Delete ${todo.title}`}>Delete</button>
              </li>
            ))}
          </ul>
        }
        <footer>Frontend: ReactJS · Backend: Django · Runtime: Docker Compose</footer>
      </section>
    </main>
  );
}
