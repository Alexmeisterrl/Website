class ProductivityApp {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('productivity-tasks')) || [];
        this.notes = JSON.parse(localStorage.getItem('productivity-notes')) || [];
        this.projects = JSON.parse(localStorage.getItem('productivity-projects')) || [];
        this.scripts = JSON.parse(localStorage.getItem('productivity-scripts')) || [];
        this.settings = JSON.parse(localStorage.getItem('productivity-settings')) || {
            theme: 'light',
            fontSize: 'medium'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.renderTasks();
        this.renderNotes();
        this.renderProjects();
        this.loadSavedScript();
    }

    setupEventListeners() {
        // Feature card clicks
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('click', () => {
                const feature = card.dataset.feature;
                switch (feature) {
                    case 'tasks':
                        window.location.href = 'tasks.html';
                        break;
                    case 'notes':
                        window.location.href = 'notes.html';
                        break;
                    case 'projects':
                        window.location.href = 'projects.html';
                        break;
                    case 'scripts':
                        window.location.href = 'scripts.html';
                        break;
                    case 'personal':
                        window.location.href = 'personal.html';
                        break;
                    default:
                        console.log('Unknown feature:', feature);
                }
            });
        });


        // Modal controls
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.btn-close').dataset.modal;
                this.closeModal(modal);
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openModal('settings-modal');
        });

        // Task management
        document.getElementById('add-task').addEventListener('click', () => {
            this.addTask();
        });

        document.getElementById('new-task').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Notes management
        document.getElementById('save-note').addEventListener('click', () => {
            this.saveNote();
        });

        // Project management
        document.getElementById('add-project').addEventListener('click', () => {
            this.addProject();
        });

        // Script management
        document.getElementById('run-script').addEventListener('click', () => {
            this.runScript();
        });

        document.getElementById('clear-script').addEventListener('click', () => {
            this.clearScript();
        });

        document.getElementById('save-script').addEventListener('click', () => {
            this.saveScript();
        });

        // Settings
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.updateTheme(e.target.value);
        });

        document.getElementById('font-size').addEventListener('change', (e) => {
            this.updateFontSize(e.target.value);
        });

        document.getElementById('export-data').addEventListener('click', () => {
            this.exportData();
        });

        document.getElementById('import-data').addEventListener('click', () => {
            this.importData();
        });

        document.getElementById('clear-all-data').addEventListener('click', () => {
            this.clearAllData();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 't':
                        e.preventDefault();
                        this.openModal('tasks-modal');
                        break;
                    case 'n':
                        e.preventDefault();
                        this.openModal('notes-modal');
                        break;
                    case 'p':
                        e.preventDefault();
                        this.openModal('projects-modal');
                        break;
                    case 'r':
                        e.preventDefault();
                        this.openModal('scripts-modal');
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus first input if available
            const firstInput = modal.querySelector('input, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
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
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        
        document.getElementById('theme-selector').value = theme;
    }

    updateFontSize(size) {
        document.body.className = document.body.className.replace(/font-\w+/, '');
        document.body.classList.add(`font-${size}`);
        this.settings.fontSize = size;
        this.saveSettings();
    }

    applySettings() {
        this.updateTheme(this.settings.theme);
        this.updateFontSize(this.settings.fontSize);
    }

    saveSettings() {
        localStorage.setItem('productivity-settings', JSON.stringify(this.settings));
    }

    // Task Management
    addTask() {
        const input = document.getElementById('new-task');
        const taskText = input.value.trim();
        
        if (taskText) {
            const task = {
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            this.tasks.unshift(task);
            this.saveTasks();
            this.renderTasks();
            input.value = '';
        }
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    renderTasks() {
        const container = document.getElementById('task-list');
        
        if (this.tasks.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Keine Aufgaben vorhanden. Füge deine erste Aufgabe hinzu!</p>';
            return;
        }
        
        container.innerHTML = this.tasks.map(task => `
            <div class="task-item fade-in">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="app.toggleTask(${task.id})">
                    ${task.completed ? '<i class="fas fa-check"></i>' : ''}
                </div>
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
                <button class="task-delete" onclick="app.deleteTask(${task.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    saveTasks() {
        localStorage.setItem('productivity-tasks', JSON.stringify(this.tasks));
    }

    // Notes Management
    saveNote() {
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        
        if (title && content) {
            const note = {
                id: Date.now(),
                title: title,
                content: content,
                createdAt: new Date().toISOString()
            };
            
            this.notes.unshift(note);
            this.saveNotes();
            this.renderNotes();
            titleInput.value = '';
            contentInput.value = '';
        }
    }

    deleteNote(id) {
        this.notes = this.notes.filter(n => n.id !== id);
        this.saveNotes();
        this.renderNotes();
    }

    renderNotes() {
        const container = document.getElementById('notes-list');
        
        if (this.notes.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Keine Notizen vorhanden. Erstelle deine erste Notiz!</p>';
            return;
        }
        
        container.innerHTML = this.notes.map(note => `
            <div class="note-item fade-in">
                <div class="note-header">
                    <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                    <span class="note-date">${this.formatDate(note.createdAt)}</span>
                </div>
                <p class="note-content">${this.escapeHtml(note.content)}</p>
                <button class="note-delete" onclick="app.deleteNote(${note.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    saveNotes() {
        localStorage.setItem('productivity-notes', JSON.stringify(this.notes));
    }

    // Project Management
    addProject() {
        const nameInput = document.getElementById('project-name');
        const statusSelect = document.getElementById('project-status');
        const descriptionInput = document.getElementById('project-description');
        
        const name = nameInput.value.trim();
        const status = statusSelect.value;
        const description = descriptionInput.value.trim();
        
        if (name) {
            const project = {
                id: Date.now(),
                name: name,
                status: status,
                description: description,
                createdAt: new Date().toISOString()
            };
            
            this.projects.unshift(project);
            this.saveProjects();
            this.renderProjects();
            nameInput.value = '';
            descriptionInput.value = '';
            statusSelect.value = 'planning';
        }
    }

    deleteProject(id) {
        this.projects = this.projects.filter(p => p.id !== id);
        this.saveProjects();
        this.renderProjects();
    }

    renderProjects() {
        const container = document.getElementById('projects-list');
        
        if (this.projects.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align: center; padding: 2rem; grid-column: 1 / -1;">Keine Projekte vorhanden. Erstelle dein erstes Projekt!</p>';
            return;
        }
        
        const statusLabels = {
            planning: 'Planung',
            active: 'Aktiv',
            completed: 'Abgeschlossen',
            paused: 'Pausiert'
        };
        
        container.innerHTML = this.projects.map(project => `
            <div class="project-card fade-in">
                <div class="project-status status-${project.status}">
                    ${statusLabels[project.status]}
                </div>
                <h4 class="project-name">${this.escapeHtml(project.name)}</h4>
                <p class="project-description">${this.escapeHtml(project.description || 'Keine Beschreibung')}</p>
                <button class="project-delete" onclick="app.deleteProject(${project.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    saveProjects() {
        localStorage.setItem('productivity-projects', JSON.stringify(this.projects));
    }

    // Script Management
    runScript() {
        const editor = document.getElementById('script-editor');
        const output = document.getElementById('script-output');
        const code = editor.value;
        
        if (!code.trim()) {
            output.textContent = 'Fehler: Kein Code zum Ausführen vorhanden.';
            return;
        }
        
        output.textContent = 'Code wird ausgeführt...\n';
        
        // Simulate Python script execution
        // In a real implementation, you would send this to a backend service
        try {
            // Basic Python-like syntax simulation
            const result = this.simulatePythonExecution(code);
            output.textContent = result;
        } catch (error) {
            output.textContent = `Fehler: ${error.message}`;
        }
    }

    simulatePythonExecution(code) {
        let output = '';
        const lines = code.split('\n');
        
        // Simple simulation - look for print statements
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('print(')) {
                const match = trimmed.match(/print\(['"](.+?)['"]\)/);
                if (match) {
                    output += match[1] + '\n';
                } else {
                    // Try to extract variables or expressions
                    const printMatch = trimmed.match(/print\((.+?)\)/);
                    if (printMatch) {
                        output += printMatch[1] + '\n';
                    }
                }
            } else if (trimmed.includes('=') && !trimmed.startsWith('#')) {
                // Variable assignment
                output += `# ${trimmed}\n`;
            }
        }
        
        if (!output) {
            output = 'Script erfolgreich ausgeführt. Keine Ausgabe generiert.\n';
        }
        
        output += '\n--- Script beendet ---';
        return output;
    }

    clearScript() {
        document.getElementById('script-editor').value = '';
        document.getElementById('script-output').textContent = '';
        this.saveScript();
    }

    saveScript() {
        const code = document.getElementById('script-editor').value;
        localStorage.setItem('productivity-current-script', code);
    }

    loadSavedScript() {
        const savedScript = localStorage.getItem('productivity-current-script');
        if (savedScript) {
            document.getElementById('script-editor').value = savedScript;
        }
    }

    // Data Management
    exportData() {
        const data = {
            tasks: this.tasks,
            notes: this.notes,
            projects: this.projects,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        
                        if (data.tasks) this.tasks = data.tasks;
                        if (data.notes) this.notes = data.notes;
                        if (data.projects) this.projects = data.projects;
                        if (data.settings) this.settings = data.settings;
                        
                        this.saveTasks();
                        this.saveNotes();
                        this.saveProjects();
                        this.saveSettings();
                        
                        this.renderTasks();
                        this.renderNotes();
                        this.renderProjects();
                        this.applySettings();
                        
                        alert('Daten erfolgreich importiert!');
                    } catch (error) {
                        alert('Fehler beim Importieren der Daten. Bitte überprüfe die Datei.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    clearAllData() {
        if (confirm('Möchtest du wirklich alle Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
            this.tasks = [];
            this.notes = [];
            this.projects = [];
            
            localStorage.removeItem('productivity-tasks');
            localStorage.removeItem('productivity-notes');
            localStorage.removeItem('productivity-projects');
            localStorage.removeItem('productivity-current-script');
            
            this.renderTasks();
            this.renderNotes();
            this.renderProjects();
            this.clearScript();
            
            alert('Alle Daten wurden gelöscht.');
        }
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

// Initialize the application
const app = new ProductivityApp();

// Auto-save script content
document.addEventListener('DOMContentLoaded', () => {
    const scriptEditor = document.getElementById('script-editor');
    if (scriptEditor) {
        scriptEditor.addEventListener('input', () => {
            app.saveScript();
        });
    }
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}