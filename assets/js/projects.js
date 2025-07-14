class ProjectsManager {
    constructor() {
        this.projects = JSON.parse(localStorage.getItem('productivity-projects')) || [];
        this.settings = JSON.parse(localStorage.getItem('productivity-settings')) || {
            theme: 'light',
            fontSize: 'medium'
        };
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.viewMode = 'grid'; // grid or list
        this.editingProjectId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.renderProjects();
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

        // View toggle
        document.getElementById('view-toggle').addEventListener('click', () => {
            this.toggleView();
        });

        // Add project
        document.getElementById('add-project').addEventListener('click', () => {
            this.addProject();
        });

        // Enter key in name should move to description
        document.getElementById('project-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('project-description').focus();
            }
        });

        // Filter tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.setFilter(tab.dataset.filter);
            });
        });

        // Sort dropdown
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.setSort(e.target.value);
        });

        // Export projects
        document.getElementById('export-projects').addEventListener('click', () => {
            this.exportProjects();
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

        // Edit project form
        document.getElementById('update-project').addEventListener('click', () => {
            this.updateProject();
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeModal('edit-project-modal');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        document.getElementById('project-name').focus();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportProjects();
                        break;
                    case 'v':
                        e.preventDefault();
                        this.toggleView();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
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

    // View Management
    toggleView() {
        this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
        const viewIcon = document.querySelector('#view-toggle i');
        viewIcon.className = this.viewMode === 'grid' ? 'fas fa-list' : 'fas fa-th-large';
        
        const projectsGrid = document.getElementById('projects-list');
        projectsGrid.className = this.viewMode === 'grid' ? 'projects-grid' : 'projects-list';
        
        this.renderProjects();
    }

    // Project Management
    addProject() {
        const nameInput = document.getElementById('project-name');
        const statusSelect = document.getElementById('project-status');
        const descriptionInput = document.getElementById('project-description');
        const deadlineInput = document.getElementById('project-deadline');
        const prioritySelect = document.getElementById('project-priority');
        
        const name = nameInput.value.trim();
        const status = statusSelect.value;
        const description = descriptionInput.value.trim();
        const deadline = deadlineInput.value;
        const priority = prioritySelect.value;
        
        if (!name) {
            this.showNotification('Bitte einen Projektnamen eingeben', 'warning');
            return;
        }
        
        const project = {
            id: Date.now(),
            name: name,
            status: status,
            description: description,
            deadline: deadline,
            priority: priority,
            notes: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: status === 'completed' ? new Date().toISOString() : null
        };
        
        this.projects.unshift(project);
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        
        // Clear form
        nameInput.value = '';
        descriptionInput.value = '';
        deadlineInput.value = '';
        statusSelect.value = 'active';
        prioritySelect.value = 'medium';
        
        this.showNotification('Projekt erstellt!', 'success');
        nameInput.focus();
    }

    editProject(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;
        
        this.editingProjectId = id;
        
        document.getElementById('edit-project-name').value = project.name;
        document.getElementById('edit-project-status').value = project.status;
        document.getElementById('edit-project-description').value = project.description;
        document.getElementById('edit-project-deadline').value = project.deadline || '';
        document.getElementById('edit-project-priority').value = project.priority;
        document.getElementById('edit-project-notes').value = project.notes || '';
        
        this.openModal('edit-project-modal');
    }

    updateProject() {
        if (!this.editingProjectId) return;
        
        const project = this.projects.find(p => p.id === this.editingProjectId);
        if (!project) return;
        
        const name = document.getElementById('edit-project-name').value.trim();
        const status = document.getElementById('edit-project-status').value;
        const description = document.getElementById('edit-project-description').value.trim();
        const deadline = document.getElementById('edit-project-deadline').value;
        const priority = document.getElementById('edit-project-priority').value;
        const notes = document.getElementById('edit-project-notes').value.trim();
        
        if (!name) {
            this.showNotification('Bitte einen Projektnamen eingeben', 'warning');
            return;
        }
        
        const wasCompleted = project.status === 'completed';
        const isNowCompleted = status === 'completed';
        
        project.name = name;
        project.status = status;
        project.description = description;
        project.deadline = deadline;
        project.priority = priority;
        project.notes = notes;
        project.updatedAt = new Date().toISOString();
        
        // Update completion date
        if (!wasCompleted && isNowCompleted) {
            project.completedAt = new Date().toISOString();
        } else if (wasCompleted && !isNowCompleted) {
            project.completedAt = null;
        }
        
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        this.closeModal('edit-project-modal');
        
        this.showNotification('Projekt aktualisiert!', 'success');
    }

    viewProjectDetails(id) {
        const project = this.projects.find(p => p.id === id);
        if (!project) return;
        
        document.getElementById('project-details-title').textContent = project.name;
        
        const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
        
        const content = `
            <div class="project-details">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Projektinformationen</h4>
                    <div class="detail-grid">
                        <div class="detail-item">
                            <label>Status:</label>
                            <span class="project-status-badge status-${project.status}">
                                ${this.getStatusLabel(project.status)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Priorität:</label>
                            <span class="priority-badge priority-${project.priority}">
                                ${this.getPriorityLabel(project.priority)}
                            </span>
                        </div>
                        <div class="detail-item">
                            <label>Erstellt:</label>
                            <span>${this.formatDate(project.createdAt)}</span>
                        </div>
                        ${project.deadline ? `
                            <div class="detail-item">
                                <label>Deadline:</label>
                                <span class="${isOverdue ? 'overdue-text' : ''}">${this.formatDate(project.deadline)}</span>
                            </div>
                        ` : ''}
                        ${project.completedAt ? `
                            <div class="detail-item">
                                <label>Abgeschlossen:</label>
                                <span>${this.formatDate(project.completedAt)}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${project.description ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-align-left"></i> Beschreibung</h4>
                        <p class="project-description">${this.escapeHtml(project.description)}</p>
                    </div>
                ` : ''}
                
                ${project.notes ? `
                    <div class="detail-section">
                        <h4><i class="fas fa-sticky-note"></i> Notizen</h4>
                        <p class="project-notes">${this.escapeHtml(project.notes)}</p>
                    </div>
                ` : ''}
                
                <div class="detail-actions">
                    <button class="btn-primary" onclick="projectsManager.editProject(${project.id}); projectsManager.closeModal('project-details-modal')">
                        <i class="fas fa-edit"></i>
                        Bearbeiten
                    </button>
                    <button class="btn-secondary" onclick="projectsManager.duplicateProject(${project.id})">
                        <i class="fas fa-copy"></i>
                        Duplizieren
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('project-details-content').innerHTML = content;
        this.openModal('project-details-modal');
    }

    duplicateProject(id) {
        const originalProject = this.projects.find(p => p.id === id);
        if (!originalProject) return;
        
        const duplicatedProject = {
            ...originalProject,
            id: Date.now(),
            name: originalProject.name + ' (Kopie)',
            status: 'planning',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            completedAt: null
        };
        
        this.projects.unshift(duplicatedProject);
        this.saveProjects();
        this.renderProjects();
        this.updateStats();
        this.closeModal('project-details-modal');
        
        this.showNotification('Projekt dupliziert!', 'success');
    }

    deleteProject(id) {
        if (confirm('Möchtest du dieses Projekt wirklich löschen?')) {
            this.projects = this.projects.filter(p => p.id !== id);
            this.saveProjects();
            this.renderProjects();
            this.updateStats();
            this.showNotification('Projekt gelöscht', 'info');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderProjects();
    }

    setSort(sort) {
        this.currentSort = sort;
        this.renderProjects();
    }

    getFilteredAndSortedProjects() {
        let filteredProjects = this.projects;
        
        // Apply filter
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'overdue') {
                filteredProjects = filteredProjects.filter(project => 
                    project.deadline && 
                    new Date(project.deadline) < new Date() && 
                    project.status !== 'completed'
                );
            } else {
                filteredProjects = filteredProjects.filter(project => project.status === this.currentFilter);
            }
        }
        
        // Apply sorting
        switch (this.currentSort) {
            case 'oldest':
                return filteredProjects.slice().reverse();
            case 'name':
                return filteredProjects.slice().sort((a, b) => a.name.localeCompare(b.name));
            case 'status':
                return filteredProjects.slice().sort((a, b) => a.status.localeCompare(b.status));
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return filteredProjects.slice().sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
            case 'deadline':
                return filteredProjects.slice().sort((a, b) => {
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
            default: // newest
                return filteredProjects;
        }
    }

    renderProjects() {
        const container = document.getElementById('projects-list');
        const filteredProjects = this.getFilteredAndSortedProjects();
        
        if (filteredProjects.length === 0) {
            const emptyMessage = this.getEmptyMessage();
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }
        
        container.innerHTML = filteredProjects.map(project => {
            const isOverdue = project.deadline && new Date(project.deadline) < new Date() && project.status !== 'completed';
            
            return `
                <div class="project-item-card ${this.viewMode === 'list' ? 'list-view' : ''} status-${project.status} priority-${project.priority} ${isOverdue ? 'overdue' : ''}" data-id="${project.id}">
                    <div class="project-header">
                        <h4 class="project-name" onclick="projectsManager.viewProjectDetails(${project.id})">${this.escapeHtml(project.name)}</h4>
                        <div class="project-badges">
                            <span class="project-status-badge status-${project.status}">
                                ${this.getStatusLabel(project.status)}
                            </span>
                            <span class="priority-badge priority-${project.priority}">
                                <i class="fas fa-flag"></i>
                            </span>
                            ${isOverdue ? '<span class="overdue-badge"><i class="fas fa-exclamation-triangle"></i></span>' : ''}
                        </div>
                    </div>
                    
                    ${project.description ? `
                        <div class="project-description">
                            ${this.truncateText(this.escapeHtml(project.description), 120)}
                        </div>
                    ` : ''}
                    
                    <div class="project-meta">
                        <span class="project-date">
                            <i class="fas fa-calendar"></i>
                            Erstellt: ${this.formatDateShort(project.createdAt)}
                        </span>
                        ${project.deadline ? `
                            <span class="project-deadline ${isOverdue ? 'overdue-text' : ''}">
                                <i class="fas fa-clock"></i>
                                Deadline: ${this.formatDateShort(project.deadline)}
                            </span>
                        ` : ''}
                        ${project.completedAt ? `
                            <span class="project-completed">
                                <i class="fas fa-check-circle"></i>
                                Abgeschlossen: ${this.formatDateShort(project.completedAt)}
                            </span>
                        ` : ''}
                    </div>
                    
                    <div class="project-actions">
                        <button class="project-action-btn" onclick="projectsManager.editProject(${project.id})" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="project-action-btn" onclick="projectsManager.viewProjectDetails(${project.id})" title="Details anzeigen">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="project-action-btn delete" onclick="projectsManager.deleteProject(${project.id})" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    getEmptyMessage() {
        switch (this.currentFilter) {
            case 'active':
                return '<i class="fas fa-play"></i><h3>Keine aktiven Projekte</h3><p>Starte dein erstes Projekt oder ändere den Status bestehender Projekte.</p>';
            case 'planning':
                return '<i class="fas fa-clipboard-list"></i><h3>Keine Projekte in Planung</h3><p>Erstelle ein neues Projekt oder ändere den Status bestehender Projekte.</p>';
            case 'completed':
                return '<i class="fas fa-check-circle"></i><h3>Noch keine abgeschlossenen Projekte</h3><p>Schließe deine ersten Projekte ab, um sie hier zu sehen.</p>';
            case 'overdue':
                return '<i class="fas fa-thumbs-up"></i><h3>Keine überfälligen Projekte</h3><p>Großartig! Alle deine Projekte sind im Zeitplan.</p>';
            default:
                return '<i class="fas fa-plus-circle"></i><h3>Noch keine Projekte</h3><p>Erstelle dein erstes Projekt, um loszulegen!</p>';
        }
    }

    getStatusLabel(status) {
        const labels = {
            planning: 'Planung',
            active: 'Aktiv',
            completed: 'Abgeschlossen',
            paused: 'Pausiert',
            cancelled: 'Abgebrochen'
        };
        return labels[status] || 'Unbekannt';
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
        const total = this.projects.length;
        const active = this.projects.filter(p => p.status === 'active').length;
        const completed = this.projects.filter(p => p.status === 'completed').length;
        const overdue = this.projects.filter(p => 
            p.deadline && 
            new Date(p.deadline) < new Date() && 
            p.status !== 'completed'
        ).length;

        document.getElementById('total-projects').textContent = total;
        document.getElementById('active-projects').textContent = active;
        document.getElementById('completed-projects').textContent = completed;
        document.getElementById('overdue-projects').textContent = overdue;
    }

    exportProjects() {
        if (this.projects.length === 0) {
            this.showNotification('Keine Projekte zum Exportieren', 'info');
            return;
        }

        const data = {
            projects: this.projects,
            exported: new Date().toISOString(),
            stats: {
                total: this.projects.length,
                active: this.projects.filter(p => p.status === 'active').length,
                completed: this.projects.filter(p => p.status === 'completed').length
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projekte-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Projekte exportiert!', 'success');
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
            this.editingProjectId = null;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        this.editingProjectId = null;
    }

    saveProjects() {
        localStorage.setItem('productivity-projects', JSON.stringify(this.projects));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
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
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatDateShort(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Initialize the projects manager
const projectsManager = new ProjectsManager();