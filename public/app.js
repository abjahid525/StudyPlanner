const STORAGE_KEY = 'study-planner-tasks-v1';

const state = {
  tasks: loadTasks(),
  filter: 'all',
  search: ''
};

const elements = {
  form: document.getElementById('task-form'),
  taskId: document.getElementById('task-id'),
  title: document.getElementById('task-title'),
  description: document.getElementById('task-description'),
  dueDate: document.getElementById('task-due-date'),
  priority: document.getElementById('task-priority'),
  taskList: document.getElementById('task-list'),
  emptyState: document.getElementById('empty-state'),
  emptyTitle: document.getElementById('empty-title'),
  emptyCopy: document.getElementById('empty-copy'),
  formHeading: document.getElementById('form-heading'),
  submitLabel: document.getElementById('submit-label'),
  cancelEdit: document.getElementById('cancel-edit'),
  search: document.getElementById('search-input'),
  toast: document.getElementById('toast')
};

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((task) => task && typeof task.id === 'string' && typeof task.title === 'string')
      .map((task) => ({
        id: task.id,
        title: task.title.trim(),
        description: typeof task.description === 'string' ? task.description : '',
        dueDate: typeof task.dueDate === 'string' ? task.dueDate : '',
        priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
        completed: task.completed === true,
        createdAt: typeof task.createdAt === 'string' ? task.createdAt : new Date().toISOString()
      }))
      .filter((task) => task.title);
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
}

function createId() {
  return window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDueDate(value) {
  if (!value) return 'No due date';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Invalid due date'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function isOverdue(task) {
  if (!task.dueDate || task.completed) return false;
  const today = new Date();
  const dueDate = new Date(`${task.dueDate}T23:59:59`);
  return !Number.isNaN(dueDate.getTime()) && dueDate < today;
}

function visibleTasks() {
  const query = state.search.trim().toLowerCase();
  return state.tasks.filter((task) => {
    const matchesFilter = state.filter === 'all'
      || (state.filter === 'active' && !task.completed)
      || (state.filter === 'completed' && task.completed);
    const matchesSearch = !query || `${task.title} ${task.description}`.toLowerCase().includes(query);
    return matchesFilter && matchesSearch;
  });
}

function render() {
  const completed = state.tasks.filter((task) => task.completed).length;
  const total = state.tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById('total-count').textContent = total;
  document.getElementById('completed-count').textContent = completed;
  document.getElementById('remaining-count').textContent = total - completed;
  document.getElementById('progress-value').textContent = `${progress}%`;
  document.getElementById('progress-bar').style.width = `${progress}%`;
  document.getElementById('all-count').textContent = total;
  document.getElementById('active-count').textContent = total - completed;
  document.getElementById('done-count').textContent = completed;

  elements.taskList.replaceChildren(...visibleTasks().map(renderTask));
  const hasVisibleTasks = visibleTasks().length > 0;
  elements.emptyState.classList.toggle('hidden', hasVisibleTasks);
  if (!hasVisibleTasks) {
    const hasTasks = state.tasks.length > 0;
    elements.emptyTitle.textContent = hasTasks ? 'No matching tasks' : 'No tasks yet';
    elements.emptyCopy.textContent = hasTasks ? 'Try another search or filter.' : 'Add your first study task to get started.';
  }
}

function renderTask(task) {
  const item = document.createElement('article');
  item.className = `task-item${task.completed ? ' completed' : ''}${isOverdue(task) ? ' overdue' : ''}`;
  item.dataset.id = task.id;

  const check = document.createElement('button');
  check.className = `check-button${task.completed ? ' completed' : ''}`;
  check.type = 'button';
  check.dataset.action = 'complete';
  check.setAttribute('aria-label', task.completed ? `Mark ${task.title} active` : `Complete ${task.title}`);
  check.textContent = task.completed ? '✓' : '';

  const main = document.createElement('div');
  main.className = 'task-main';
  const title = document.createElement('div');
  title.className = 'task-title';
  title.textContent = task.title;
  main.append(title);
  if (task.description) {
    const description = document.createElement('div');
    description.className = 'task-description';
    description.textContent = task.description;
    main.append(description);
  }
  const meta = document.createElement('div');
  meta.className = 'task-meta';
  const priority = document.createElement('span');
  priority.className = `priority priority-${task.priority}`;
  priority.textContent = task.priority;
  const due = document.createElement('span');
  due.textContent = isOverdue(task) ? `${formatDueDate(task.dueDate)} · overdue` : formatDueDate(task.dueDate);
  meta.append(priority, due);
  main.append(meta);

  const actions = document.createElement('div');
  actions.className = 'task-actions';
  actions.innerHTML = '<button class="icon-button" type="button" data-action="edit">Edit</button><button class="icon-button delete" type="button" data-action="delete">Delete</button>';
  item.append(check, main, actions);
  return item;
}

function resetForm() {
  elements.form.reset();
  elements.taskId.value = '';
  elements.priority.value = 'medium';
  elements.formHeading.textContent = 'Add a new task';
  elements.submitLabel.textContent = 'Add task';
  elements.cancelEdit.classList.add('hidden');
}

function editTask(task) {
  elements.taskId.value = task.id;
  elements.title.value = task.title;
  elements.description.value = task.description;
  elements.dueDate.value = task.dueDate;
  elements.priority.value = task.priority;
  elements.formHeading.textContent = 'Edit task';
  elements.submitLabel.textContent = 'Save changes';
  elements.cancelEdit.classList.remove('hidden');
  elements.title.focus();
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  window.setTimeout(() => elements.toast.classList.remove('show'), 2200);
}

elements.form.addEventListener('submit', (event) => {
  event.preventDefault();
  const title = elements.title.value.trim();
  if (!title) {
    elements.title.focus();
    showToast('Add a task title first');
    return;
  }
  const existingId = elements.taskId.value;
  if (existingId) {
    const task = state.tasks.find((item) => item.id === existingId);
    Object.assign(task, { title, description: elements.description.value.trim(), dueDate: elements.dueDate.value, priority: elements.priority.value });
    showToast('Task updated');
  } else {
    state.tasks.unshift({ id: createId(), title, description: elements.description.value.trim(), dueDate: elements.dueDate.value, priority: elements.priority.value, completed: false, createdAt: new Date().toISOString() });
    showToast('Task added');
  }
  saveTasks();
  resetForm();
  render();
});

elements.cancelEdit.addEventListener('click', resetForm);
elements.search.addEventListener('input', (event) => { state.search = event.target.value; render(); });
document.querySelectorAll('.filter-tab').forEach((button) => {
  button.addEventListener('click', () => {
    state.filter = button.dataset.filter;
    document.querySelectorAll('.filter-tab').forEach((tab) => {
      const active = tab === button;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active);
    });
    render();
  });
});

elements.taskList.addEventListener('click', (event) => {
  const action = event.target.dataset.action;
  const item = event.target.closest('.task-item');
  if (!action || !item) return;
  const task = state.tasks.find((entry) => entry.id === item.dataset.id);
  if (!task) return;
  if (action === 'complete') {
    task.completed = !task.completed;
    saveTasks();
    render();
    return;
  }
  if (action === 'edit') {
    editTask(task);
    return;
  }
  if (action === 'delete') {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    state.tasks = state.tasks.filter((entry) => entry.id !== task.id);
    saveTasks();
    render();
    showToast('Task deleted');
  }
});

document.getElementById('today-date').textContent = new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date());
render();
