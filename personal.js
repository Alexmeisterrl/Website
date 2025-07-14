class PersonalInfoManager {
    constructor() {
        this.personalData = JSON.parse(localStorage.getItem('personal-info')) || {
            name: '[Dein Name]',
            title: '[Deine Berufsbezeichnung/Rolle]',
            location: '[Dein Standort]',
            about: '[Hier kannst du eine persönliche Beschreibung über dich einfügen. Erzähle von deinen Interessen, deiner Motivation und was dich antreibt. Dies ist dein Raum, um dich vorzustellen.]',
            email: '[deine-email]',
            github: 'https://github.com/[dein-username]',
            linkedin: 'https://linkedin.com/in/[dein-profil]',
            portfolio: '[deine-portfolio-url]'
        };
        
        this.settings = JSON.parse(localStorage.getItem('productivity-settings')) || {
            theme: 'light',
            fontSize: 'medium'
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.loadPersonalInfo();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Edit mode button
        const editBtn = document.getElementById('edit-mode-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                this.openEditModal();
            });
        }

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

        // Save personal info
        const saveBtn = document.getElementById('save-personal-info');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.savePersonalInfo();
            });
        }

        // Cancel edit
        const cancelBtn = document.getElementById('cancel-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal('edit-modal');
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.openEditModal();
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

    // Personal Info Management
    loadPersonalInfo() {
        // Update profile section
        const profileName = document.querySelector('.profile-name');
        const profileTitle = document.querySelector('.profile-title');
        const profileLocation = document.querySelector('.profile-location');
        const aboutText = document.querySelector('.about-text');

        if (profileName) profileName.textContent = this.personalData.name;
        if (profileTitle) profileTitle.textContent = this.personalData.title;
        if (profileLocation) {
            profileLocation.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${this.personalData.location}`;
        }
        if (aboutText) aboutText.textContent = this.personalData.about;

        // Update contact links
        const contactLinks = document.querySelectorAll('.contact-link');
        contactLinks.forEach(link => {
            const icon = link.querySelector('i');
            if (icon.classList.contains('fa-envelope')) {
                link.href = `mailto:${this.personalData.email}`;
            } else if (icon.classList.contains('fa-github')) {
                link.href = this.personalData.github;
            } else if (icon.classList.contains('fa-linkedin')) {
                link.href = this.personalData.linkedin;
            } else if (icon.classList.contains('fa-globe')) {
                link.href = this.personalData.portfolio;
            }
        });
    }

    openEditModal() {
        // Fill form with current data
        document.getElementById('edit-name').value = this.personalData.name === '[Dein Name]' ? '' : this.personalData.name;
        document.getElementById('edit-title').value = this.personalData.title === '[Deine Berufsbezeichnung/Rolle]' ? '' : this.personalData.title;
        document.getElementById('edit-location').value = this.personalData.location === '[Dein Standort]' ? '' : this.personalData.location;
        document.getElementById('edit-about').value = this.personalData.about.startsWith('[Hier kannst du') ? '' : this.personalData.about;
        document.getElementById('edit-email').value = this.personalData.email === '[deine-email]' ? '' : this.personalData.email;
        document.getElementById('edit-github').value = this.personalData.github.includes('[dein-username]') ? '' : this.personalData.github;
        document.getElementById('edit-linkedin').value = this.personalData.linkedin.includes('[dein-profil]') ? '' : this.personalData.linkedin;
        document.getElementById('edit-portfolio').value = this.personalData.portfolio === '[deine-portfolio-url]' ? '' : this.personalData.portfolio;

        this.openModal('edit-modal');
    }

    savePersonalInfo() {
        // Get values from form
        const name = document.getElementById('edit-name').value.trim();
        const title = document.getElementById('edit-title').value.trim();
        const location = document.getElementById('edit-location').value.trim();
        const about = document.getElementById('edit-about').value.trim();
        const email = document.getElementById('edit-email').value.trim();
        const github = document.getElementById('edit-github').value.trim();
        const linkedin = document.getElementById('edit-linkedin').value.trim();
        const portfolio = document.getElementById('edit-portfolio').value.trim();

        // Update personal data with fallbacks to placeholders
        this.personalData = {
            name: name || '[Dein Name]',
            title: title || '[Deine Berufsbezeichnung/Rolle]',
            location: location || '[Dein Standort]',
            about: about || '[Hier kannst du eine persönliche Beschreibung über dich einfügen. Erzähle von deinen Interessen, deiner Motivation und was dich antreibt. Dies ist dein Raum, um dich vorzustellen.]',
            email: email || '[deine-email]',
            github: github || 'https://github.com/[dein-username]',
            linkedin: linkedin || 'https://linkedin.com/in/[dein-profil]',
            portfolio: portfolio || '[deine-portfolio-url]'
        };

        // Save to localStorage
        localStorage.setItem('personal-info', JSON.stringify(this.personalData));

        // Update display
        this.loadPersonalInfo();

        // Close modal
        this.closeModal('edit-modal');

        // Show success message
        this.showNotification('Persönliche Informationen wurden gespeichert!', 'success');
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
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility Functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the personal info manager
const personalInfoManager = new PersonalInfoManager();