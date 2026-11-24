const themeToggle = document.getElementById('themeToggle');
const currentDate = document.getElementById('currentDate');
const quickTasks = document.getElementById('quickTasks');
const quickTaskForm = document.getElementById('quickTaskForm');
const quickTaskInput = document.getElementById('quickTaskInput');
const progressFill = document.getElementById('progressFill');
const progressValue = document.getElementById('progressValue');

const storageKey = 'mini-dashboard-theme';
const tasksStorageKey = 'mini-dashboard-quick-tasks';
const savedTheme = ['light', 'dark'].includes(localStorage.getItem(storageKey))
  ? localStorage.getItem(storageKey)
  : 'light';
let quickTaskItems = loadQuickTasks();

function loadQuickTasks() {
  const savedTasks = localStorage.getItem(tasksStorageKey);

  if (!savedTasks) {
    return [
      { id: 1, label: 'Réviser JavaScript', completed: true },
      { id: 2, label: 'Préparer le portfolio GitHub', completed: false },
      { id: 3, label: 'Relire les projets du jour', completed: false },
    ];
  }

  try {
    const parsedTasks = JSON.parse(savedTasks);

    if (!Array.isArray(parsedTasks)) {
      return [];
    }

    return parsedTasks
      .filter((task) => task && typeof task.label === 'string')
      .map((task) => ({
        id: task.id || Date.now() + Math.random(),
        label: task.label.slice(0, 60),
        completed: Boolean(task.completed),
      }));
  } catch {
    return [];
  }
}

function saveQuickTasks() {
  localStorage.setItem(tasksStorageKey, JSON.stringify(quickTaskItems));
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre';
  themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
  localStorage.setItem(storageKey, theme);
}

function formatDate() {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

function updateProgress() {
  const totalTasks = quickTaskItems.length;
  const completedTasks = quickTaskItems.filter((task) => task.completed).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  progressFill.style.width = `${progressPercentage}%`;
  progressValue.textContent = `${progressPercentage}%`;
}

function renderQuickTasks() {
  quickTasks.replaceChildren();

  quickTaskItems.forEach((task) => {
    const item = document.createElement('li');
    item.className = `quick-task-item${task.completed ? ' completed' : ''}`;

    const main = document.createElement('div');
    main.className = 'quick-task-main';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.id = `task-${task.id}`;
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveQuickTasks();
      item.classList.toggle('completed', task.completed);
      updateProgress();
    });

    const label = document.createElement('label');
    label.setAttribute('for', checkbox.id);
    label.textContent = task.label;

    const deleteButton = document.createElement('button');
    deleteButton.className = 'quick-task-delete';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Supprimer';
    deleteButton.setAttribute('aria-label', `Supprimer la tache ${task.label}`);
    deleteButton.addEventListener('click', () => {
      quickTaskItems = quickTaskItems.filter((currentTask) => currentTask.id !== task.id);
      saveQuickTasks();
      renderQuickTasks();
    });

    main.append(checkbox, label);
    item.append(main, deleteButton);
    quickTasks.append(item);
  });

  updateProgress();
}

currentDate.textContent = formatDate();
renderQuickTasks();
applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme);
});

quickTaskForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const newTaskLabel = quickTaskInput.value.trim();

  if (!newTaskLabel) {
    return;
  }

  quickTaskItems.unshift({
    id: Date.now(),
    label: newTaskLabel,
    completed: false,
  });

  quickTaskInput.value = '';
  saveQuickTasks();
  renderQuickTasks();
});
