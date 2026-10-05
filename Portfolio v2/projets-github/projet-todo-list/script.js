const STORAGE_KEY = "portfolio-todo-list";

const form = document.querySelector("#taskForm");
const input = document.querySelector("#taskInput");
const listElement = document.querySelector("#taskList");
const emptyState = document.querySelector("#emptyState");
const taskCounter = document.querySelector("#taskCounter");
const clearCompletedButton = document.querySelector("#clearCompleted");

let todos = loadTodos();

function loadTodos() {
  try {
    const savedTodos = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(savedTodos) ? savedTodos : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function updateCounter() {
  const remainingTasks = todos.filter((todo) => !todo.done).length;
  taskCounter.textContent = `${remainingTasks} ${remainingTasks > 1 ? "taches restantes" : "tache restante"}`;
  clearCompletedButton.disabled = !todos.some((todo) => todo.done);
}

function createTaskItem(todo) {
  const item = document.createElement("li");
  item.className = `task-item${todo.done ? " completed" : ""}`;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.done;
  checkbox.id = `task-${todo.id}`;

  const label = document.createElement("label");
  label.setAttribute("for", checkbox.id);
  label.textContent = todo.text;

  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = todo.text;
  editInput.maxLength = 80;
  editInput.className = "task-edit";
  editInput.setAttribute("aria-label", `Modifier la tache ${todo.text}`);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "task-delete";
  deleteButton.textContent = "Supprimer";

  checkbox.addEventListener("change", () => {
    todo.done = checkbox.checked;
    saveTodos();
    renderTodos();
  });

  editInput.addEventListener("change", () => {
    const nextText = editInput.value.trim();
    if (!nextText) {
      editInput.value = todo.text;
      return;
    }

    todo.text = nextText;
    saveTodos();
    renderTodos();
  });

  deleteButton.addEventListener("click", () => {
    todos = todos.filter((currentTodo) => currentTodo.id !== todo.id);
    saveTodos();
    renderTodos();
  });

  item.append(checkbox, label, editInput, deleteButton);
  return item;
}

function renderTodos() {
  listElement.replaceChildren(...todos.map(createTaskItem));
  emptyState.hidden = todos.length > 0;
  updateCounter();
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  todos.unshift({
    id: Date.now(),
    text,
    done: false,
  });

  input.value = "";
  saveTodos();
  renderTodos();
});

clearCompletedButton.addEventListener("click", () => {
  todos = todos.filter((todo) => !todo.done);
  saveTodos();
  renderTodos();
});

renderTodos();
