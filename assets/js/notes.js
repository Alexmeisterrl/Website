class NotesManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('productivity-notes')) || [];
        this.settings = JSON.parse(localStorage.getItem('productivity-settings')) || {
            theme: 'light',
            fontSize: 'medium'
        };
        this.currentFilter = 'all';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.editingNoteId = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.renderNotes();
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

        // Search toggle
        document.getElementById('search-toggle').addEventListener('click', () => {
            this.toggleSearch();
        });

        // Search functionality
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderNotes();
        });

        document.getElementById('clear-search').addEventListener('click', () => {
            this.clearSearch();
        });

        // Save note
        document.getElementById('save-note').addEventListener('click', () => {
            this.saveNote();
        });

        // Enter key in title should move to content
        document.getElementById('note-title').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                document.getElementById('note-content').focus();
            }
        });

        // Ctrl+Enter to save note
        document.getElementById('note-content').addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                this.saveNote();
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

        // Export notes
        document.getElementById('export-notes').addEventListener('click', () => {
            this.exportNotes();
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

        // Edit note form
        document.getElementById('update-note').addEventListener('click', () => {
            this.updateNote();
        });

        document.getElementById('cancel-edit').addEventListener('click', () => {
            this.closeModal('edit-note-modal');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'n':
                        e.preventDefault();
                        document.getElementById('note-title').focus();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.toggleSearch();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportNotes();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.clearSearch();
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

    // Search Management
    toggleSearch() {
        const searchSection = document.getElementById('search-section');
        const searchInput = document.getElementById('search-input');
        
        if (searchSection.classList.contains('hidden')) {
            searchSection.classList.remove('hidden');
            setTimeout(() => searchInput.focus(), 100);
        } else {
            this.clearSearch();
            searchSection.classList.add('hidden');
        }
    }

    clearSearch() {
        this.searchQuery = '';
        document.getElementById('search-input').value = '';
        this.renderNotes();
    }

    // Notes Management
    saveNote() {
        const titleInput = document.getElementById('note-title');
        const contentInput = document.getElementById('note-content');
        const categorySelect = document.getElementById('note-category');
        
        const title = titleInput.value.trim();
        const content = contentInput.value.trim();
        const category = categorySelect.value;
        
        if (!title && !content) {
            this.showNotification('Titel oder Inhalt eingeben', 'warning');
            return;
        }
        
        if (!title) {
            this.showNotification('Bitte einen Titel eingeben', 'warning');
            return;
        }
        
        const note = {
            id: Date.now(),
            title: title,
            content: content,
            category: category,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.unshift(note);
        this.saveNotes();
        this.renderNotes();
        this.updateStats();
        
        titleInput.value = '';
        contentInput.value = '';
        categorySelect.value = 'personal';
        
        this.showNotification('Notiz gespeichert!', 'success');
        titleInput.focus();
    }

    editNote(id) {
        const note = this.notes.find(n => n.id === id);
        if (!note) return;
        
        this.editingNoteId = id;
        
        document.getElementById('edit-note-title').value = note.title;
        document.getElementById('edit-note-content').value = note.content;
        document.getElementById('edit-note-category').value = note.category;
        
        this.openModal('edit-note-modal');
    }

    updateNote() {
        if (!this.editingNoteId) return;
        
        const note = this.notes.find(n => n.id === this.editingNoteId);
        if (!note) return;
        
        const title = document.getElementById('edit-note-title').value.trim();
        const content = document.getElementById('edit-note-content').value.trim();
        const category = document.getElementById('edit-note-category').value;
        
        if (!title) {
            this.showNotification('Bitte einen Titel eingeben', 'warning');
            return;
        }
        
        note.title = title;
        note.content = content;
        note.category = category;
        note.updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.renderNotes();
        this.updateStats();
        this.closeModal('edit-note-modal');
        
        this.showNotification('Notiz aktualisiert!', 'success');
    }

    deleteNote(id) {
        if (confirm('Möchtest du diese Notiz wirklich löschen?')) {
            this.notes = this.notes.filter(n => n.id !== id);
            this.saveNotes();
            this.renderNotes();
            this.updateStats();
            this.showNotification('Notiz gelöscht', 'info');
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderNotes();
    }

    setSort(sort) {
        this.currentSort = sort;
        this.renderNotes();
    }

    getFilteredAndSortedNotes() {
        let filteredNotes = this.notes;
        
        // Apply category filter
        if (this.currentFilter !== 'all') {
            filteredNotes = filteredNotes.filter(note => note.category === this.currentFilter);
        }
        
        // Apply search filter
        if (this.searchQuery) {
            filteredNotes = filteredNotes.filter(note => 
                note.title.toLowerCase().includes(this.searchQuery) ||
                note.content.toLowerCase().includes(this.searchQuery)
            );
        }
        
        // Apply sorting
        switch (this.currentSort) {
            case 'oldest':
                return filteredNotes.slice().reverse();
            case 'title':
                return filteredNotes.slice().sort((a, b) => a.title.localeCompare(b.title));
            case 'category':
                return filteredNotes.slice().sort((a, b) => a.category.localeCompare(b.category));
            default: // newest
                return filteredNotes;
        }
    }

    renderNotes() {
        const container = document.getElementById('notes-list');
        const filteredNotes = this.getFilteredAndSortedNotes();
        
        if (filteredNotes.length === 0) {
            const emptyMessage = this.getEmptyMessage();
            container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
            return;
        }
        
        container.innerHTML = filteredNotes.map(note => `
            <div class="note-item-card category-${note.category}" data-id="${note.id}">
                <div class="note-header">
                    <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                    <div class="note-actions">
                        <button class="note-edit" onclick="notesManager.editNote(${note.id})" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-delete" onclick="notesManager.deleteNote(${note.id})" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content">
                    ${this.formatNoteContent(note.content)}
                </div>
                <div class="note-meta">
                    <span class="note-category category-${note.category}">
                        <i class="fas fa-tag"></i>
                        ${this.getCategoryLabel(note.category)}
                    </span>
                    <span class="note-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(note.createdAt)}
                    </span>
                    ${note.updatedAt !== note.createdAt ? `
                        <span class="note-updated">
                            <i class="fas fa-edit"></i>
                            Bearbeitet: ${this.formatDate(note.updatedAt)}
                        </span>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    formatNoteContent(content) {
        if (!content) return '<em class="note-empty">Kein Inhalt</em>';
        
        // Convert line breaks to <br> and limit to 3 lines for preview
        const lines = content.split('\n').slice(0, 3);
        const formatted = lines.map(line => this.escapeHtml(line)).join('<br>');
        
        if (content.split('\n').length > 3) {
            return formatted + '<br><em class="note-more">...</em>';
        }
        
        return formatted;
    }

    getCategoryLabel(category) {
        const labels = {
            personal: 'Persönlich',
            work: 'Arbeit',
            ideas: 'Ideen',
            todo: 'To-Do',
            other: 'Sonstiges'
        };
        return labels[category] || 'Sonstiges';
    }

    getEmptyMessage() {
        if (this.searchQuery) {
            return '<i class="fas fa-search"></i><h3>Keine Ergebnisse</h3><p>Keine Notizen gefunden für "' + this.escapeHtml(this.searchQuery) + '"</p>';
        }
        
        if (this.currentFilter !== 'all') {
            return '<i class="fas fa-folder-open"></i><h3>Keine Notizen in dieser Kategorie</h3><p>Erstelle deine erste Notiz in der Kategorie "' + this.getCategoryLabel(this.currentFilter) + '"</p>';
        }
        
        return '<i class="fas fa-plus-circle"></i><h3>Noch keine Notizen</h3><p>Erstelle deine erste Notiz, um loszulegen!</p>';
    }

    updateStats() {
        const total = this.notes.length;
        const categories = new Set(this.notes.map(n => n.category)).size;
        
        // Count notes from this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentNotes = this.notes.filter(n => new Date(n.createdAt) > oneWeekAgo).length;
        
        // Count total words
        const totalWords = this.notes.reduce((sum, note) => {
            const words = (note.title + ' ' + note.content).trim().split(/\s+/).length;
            return sum + (words === 1 && !note.title && !note.content ? 0 : words);
        }, 0);

        document.getElementById('total-notes').textContent = total;
        document.getElementById('categories-count').textContent = categories;
        document.getElementById('recent-notes').textContent = recentNotes;
        document.getElementById('total-words').textContent = totalWords.toLocaleString();
    }

    exportNotes() {
        if (this.notes.length === 0) {
            this.showNotification('Keine Notizen zum Exportieren', 'info');
            return;
        }

        const data = {
            notes: this.notes,
            exported: new Date().toISOString(),
            stats: {
                total: this.notes.length,
                categories: new Set(this.notes.map(n => n.category)).size
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notizen-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Notizen exportiert!', 'success');
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
            this.editingNoteId = null;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
        this.editingNoteId = null;
    }

    saveNotes() {
        localStorage.setItem('productivity-notes', JSON.stringify(this.notes));
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
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}

// Initialize the notes manager
const notesManager = new NotesManager();