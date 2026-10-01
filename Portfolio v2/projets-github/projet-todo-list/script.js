const input = document.getElementById("TaskInput");
const listElement = document.getElementById("taskList");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

// enregistrer
function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  listElement.innerHTML = "";

  todos.forEach((todo, index) => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = todo.done;
    checkbox.addEventListener("change", () => {
      todo.done = checkbox.checked;
      saveTodos();
      renderTodos();
    });

    const textInput = document.createElement("input");
    textInput.type = "text";
    textInput.value = todo.text;
    textInput.addEventListener("input", () => {
      todo.text = textInput.value;
      saveTodos();
    });

    if (todo.done) {
      textInput.style.textDecoration = "line-through";
      textInput.style.opacity = "0.6";
    } else {
      textInput.style.textDecoration = "none";
      textInput.style.opacity = "1";
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "🗑";
    deleteBtn.classList.add("button-delete");
    deleteBtn.addEventListener("click", () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    });

    li.append(checkbox, textInput, deleteBtn);
    listElement.appendChild(li);
  });
}

function addTask() {
  const text = input.value.trim();
  if (text !== "") {
    todos.push({ text, done: false });
    input.value = "";
    saveTodos();
    renderTodos();
  }
}

renderTodos();
