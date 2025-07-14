class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('productivity-tasks')) || [];
        this.settings = JSON.parse(localStorage.getItem('productivity-settings')) || {
            theme: 'light',
            fontSize: 'medium'
        };
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.renderTasks();
        this.updateStats();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Add task
        document.getElementById('add-task').addEventListener('click', () => {
            this.addTask();
        });

        document.getElementById('new-task').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setFilter(tab.dataset.filter);
            });
        });

        // Clear completed tasks
        document.getElementById('clear-completed').addEventListener('click', () => {
            this.clearCompleted();
        });

        // Export tasks
        document.getElementById('export-tasks').addEventListener('click', () => {
            this.exportTasks();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        document.getElementById('new-task').focus();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportTasks();
                        break;
                }
            }
        });
    }

    // Theme Management
    toggleTheme() {
        const currentTheme = document.documentElement.dataset.theme || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.updateTheme(newTheme);
    }

    updateTheme(theme) {
        document.documentElement.dataset.theme = theme;
        this.settings.theme = theme;
        this.saveSettings();
        
        const themeIcon = document.querySelector('#theme-toggle i');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    applySettings() {
        this.updateTheme(this.settings.theme);
        document.body.classList.add(`font-${this.settings.fontSize}`);
    }

    saveSettings() {
        localStorage.setItem('productivity-settings', JSON.stringify(this.settings));
    }

    // Task Management
    addTask() {
        const input = document.getElementById('new-task');
        const prioritySelect = document.getElementById('task-priority');
        const taskText = input.value.trim();
        const priority = prioritySelect.value;
        
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                priority: priority,
                createdAt: new Date().toISOString(),
                completedAt: null
            };
            
            this.tasks.unshift(task);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            input.value = '';
            this.showNotification('Aufgabe hinzugefügt!', 'success');
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            if (task.completed) {
                this.showNotification('Aufgabe erledigt! 🎉', 'success');
            }
        }
    }

    deleteTask(id) {
        if (confirm('Möchtest du diese Aufgabe wirklich löschen?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification('Aufgabe gelöscht', 'info');
        }
    }

    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            this.showNotification('Keine erledigten Aufgaben zum Löschen', 'info');
            return;
        }
        
        if (confirm(`Möchtest du wirklich alle ${completedCount} erledigten Aufgaben löschen?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.showNotification(`${completedCount} erledigte Aufgaben gelöscht`, 'success');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            case 'high':
                return this.tasks.filter(t => t.priority === 'high' && !t.completed);
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const container = document.getElementById('task-list');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            const emptyMessage = this.getEmptyMessage();
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }
        
        container.innerHTML = filteredTasks.map(task => `
            <div class="task-item-card ${task.completed ? 'completed' : ''} priority-${task.priority}" data-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="taskManager.toggleTask(${task.id})">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <div class="task-content">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                    <div class="task-meta">
                        <span class="task-priority priority-${task.priority}">
                            <i class="fas fa-flag"></i>
                            ${this.getPriorityLabel(task.priority)}
                        </span>
                        <span class="task-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(task.createdAt)}
                        </span>
                        ${task.completed ? `
                            <span class="task-completed-date">
                                <i class="fas fa-check-circle"></i>
                                Erledigt: ${this.formatDate(task.completedAt)}
                            </span>
                        ` : ''}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-delete" onclick="taskManager.deleteTask(${task.id})" title="Aufgabe löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'pending':
                return '<i class="fas fa-check-circle"></i><h3>Alle Aufgaben erledigt!</h3><p>Großartig! Du hast alle deine Aufgaben abgeschlossen.</p>';
            case 'completed':
                return '<i class="fas fa-clock"></i><h3>Noch keine erledigten Aufgaben</h3><p>Erledige deine ersten Aufgaben, um sie hier zu sehen.</p>';
            case 'high':
                return '<i class="fas fa-thumbs-up"></i><h3>Keine dringenden Aufgaben</h3><p>Alles Wichtige ist erledigt oder du hast noch keine Aufgaben mit hoher Priorität.</p>';
            default:
                return '<i class="fas fa-plus-circle"></i><h3>Noch keine Aufgaben</h3><p>Füge deine erste Aufgabe hinzu, um loszulegen!</p>';
        }
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Niedrig',
            medium: 'Mittel',
            high: 'Hoch'
        };
        return labels[priority] || 'Mittel';
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        document.getElementById('total-tasks').textContent = total;
        document.getElementById('pending-tasks').textContent = pending;
        document.getElementById('completed-tasks').textContent = completed;
        document.getElementById('completion-rate').textContent = `${completionRate}%`;
    }

    exportTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('Keine Aufgaben zum Exportieren', 'info');
            return;
        }

        const data = {
            tasks: this.tasks,
            exported: new Date().toISOString(),
            stats: {
                total: this.tasks.length,
                completed: this.tasks.filter(t => t.completed).length,
                pending: this.tasks.filter(t => !t.completed).length
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aufgaben-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Aufgaben exportiert!', 'success');
    }

    saveTasks() {
        localStorage.setItem('productivity-tasks', JSON.stringify(this.tasks));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Hide and remove notification
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the task manager
const taskManager = new TaskManager();