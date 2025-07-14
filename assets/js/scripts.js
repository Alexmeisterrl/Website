class ScriptRunner {
    constructor() {
        this.savedScripts = JSON.parse(localStorage.getItem('productivity-scripts')) || [];
        this.settings = JSON.parse(localStorage.getItem('productivity-settings')) || {
            theme: 'light',
            fontSize: 'medium'
        };
        this.currentTab = 'editor';
        this.executionCount = parseInt(localStorage.getItem('script-execution-count')) || 0;
        this.lastRuntime = 0;
        this.isFullscreen = false;
        
        this.templates = [
            {
                name: 'Hello World',
                description: 'Einfaches Hello World Beispiel',
                code: 'print("Hello World!")\nprint("Willkommen beim Script Runner!")'
            },
            {
                name: 'Variablen & Eingabe',
                description: 'Arbeiten mit Variablen und Benutzereingaben',
                code: '# Variablen definieren\nname = "Python"\nversion = 3.9\n\n# Ausgabe formatieren\nprint(f"Sprache: {name}")\nprint(f"Version: {version}")\n\n# Benutzereingabe simulieren\n# name = input("Wie heißt du? ")\n# print(f"Hallo {name}!")'
            },
            {
                name: 'Schleifen',
                description: 'For- und While-Schleifen',
                code: '# For-Schleife\nprint("For-Schleife:")\nfor i in range(5):\n    print(f"Zahl: {i}")\n\n# While-Schleife\nprint("\\nWhile-Schleife:")\ncount = 0\nwhile count < 3:\n    print(f"Count: {count}")\n    count += 1'
            },
            {
                name: 'Listen & Dictionaries',
                description: 'Arbeiten mit Listen und Dictionaries',
                code: '# Listen\nfruits = ["Apfel", "Banane", "Orange"]\nprint("Früchte:", fruits)\n\nfor fruit in fruits:\n    print(f"- {fruit}")\n\n# Dictionary\nperson = {\n    "name": "Max",\n    "age": 25,\n    "city": "Berlin"\n}\n\nfor key, value in person.items():\n    print(f"{key}: {value}")'
            },
            {
                name: 'Funktionen',
                description: 'Funktionen definieren und verwenden',
                code: '# Einfache Funktion\ndef greet(name):\n    return f"Hallo {name}!"\n\n# Funktion mit mehreren Parametern\ndef add_numbers(a, b):\n    return a + b\n\n# Funktionen aufrufen\nprint(greet("Python"))\nprint(f"5 + 3 = {add_numbers(5, 3)}")\n\n# Lambda Funktion\nsquare = lambda x: x ** 2\nprint(f"4 zum Quadrat = {square(4)}")'
            },
            {
                name: 'Mathematik',
                description: 'Mathematische Operationen und Berechnungen',
                code: 'import math\n\n# Grundrechenarten\na, b = 10, 3\nprint(f"Addition: {a} + {b} = {a + b}")\nprint(f"Subtraktion: {a} - {b} = {a - b}")\nprint(f"Multiplikation: {a} * {b} = {a * b}")\nprint(f"Division: {a} / {b} = {a / b:.2f}")\n\n# Erweiterte Mathematik\nprint(f"Quadratwurzel von 16: {math.sqrt(16)}")\nprint(f"Pi: {math.pi:.4f}")\nprint(f"Sinus von 90°: {math.sin(math.radians(90))}")'
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.applySettings();
        this.loadCurrentScript();
        this.renderSavedScripts();
        this.renderTemplates();
        this.updateStats();
        this.updateLineNumbers();
        this.updateEditorInfo();
    }

    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Fullscreen toggle
        document.getElementById('fullscreen-toggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Tab switching
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.dataset.tab);
            });
        });

        // Script editor events
        const scriptEditor = document.getElementById('script-editor');
        scriptEditor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateEditorInfo();
            this.autoSaveCurrentScript();
        });

        scriptEditor.addEventListener('scroll', () => {
            this.syncLineNumbersScroll();
        });

        scriptEditor.addEventListener('keydown', (e) => {
            this.handleEditorKeydown(e);
        });

        scriptEditor.addEventListener('click', () => {
            this.updateEditorInfo();
        });

        scriptEditor.addEventListener('keyup', () => {
            this.updateEditorInfo();
        });

        // Script name input
        document.getElementById('script-name').addEventListener('input', () => {
            this.autoSaveCurrentScript();
        });

        // Action buttons
        document.getElementById('run-script').addEventListener('click', () => {
            this.runScript();
        });

        document.getElementById('clear-editor').addEventListener('click', () => {
            this.clearEditor();
        });

        document.getElementById('save-script').addEventListener('click', () => {
            this.openSaveDialog();
        });

        document.getElementById('format-code').addEventListener('click', () => {
            this.formatCode();
        });

        document.getElementById('clear-output').addEventListener('click', () => {
            this.clearOutput();
        });

        document.getElementById('copy-output').addEventListener('click', () => {
            this.copyOutput();
        });

        // Saved scripts actions
        document.getElementById('import-script').addEventListener('click', () => {
            this.importScript();
        });

        document.getElementById('export-all-scripts').addEventListener('click', () => {
            this.exportAllScripts();
        });

        // Save dialog
        document.getElementById('confirm-save-script').addEventListener('click', () => {
            this.confirmSaveScript();
        });

        document.getElementById('cancel-save-script').addEventListener('click', () => {
            this.closeModal('save-script-modal');
        });

        // Modal controls
        document.querySelectorAll('.btn-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.btn-close').dataset.modal;
                this.closeModal(modal);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.runScript();
                        break;
                    case 's':
                        e.preventDefault();
                        this.openSaveDialog();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.clearEditor();
                        break;
                    case 'f':
                        e.preventDefault();
                        this.formatCode();
                        break;
                    case 'F11':
                        e.preventDefault();
                        this.toggleFullscreen();
                        break;
                }
            }
            if (e.key === 'Escape') {
                this.closeAllModals();
                if (this.isFullscreen) {
                    this.toggleFullscreen();
                }
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.updateLineNumbers();
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

    // Fullscreen Management
    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        const editorSection = document.querySelector('.editor-section');
        const fullscreenIcon = document.querySelector('#fullscreen-toggle i');
        
        if (this.isFullscreen) {
            editorSection.classList.add('fullscreen');
            fullscreenIcon.className = 'fas fa-compress';
            document.body.style.overflow = 'hidden';
        } else {
            editorSection.classList.remove('fullscreen');
            fullscreenIcon.className = 'fas fa-expand';
            document.body.style.overflow = '';
        }
    }

    // Tab Management
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab appearance
        document.querySelectorAll('.editor-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        if (tabName === 'saved') {
            this.renderSavedScripts();
        } else if (tabName === 'templates') {
            this.renderTemplates();
        }
    }

    // Editor Management
    updateLineNumbers() {
        const editor = document.getElementById('script-editor');
        const lineNumbers = document.getElementById('line-numbers');
        const lines = editor.value.split('\n').length;
        
        let numbersHtml = '';
        for (let i = 1; i <= lines; i++) {
            numbersHtml += i + '\n';
        }
        lineNumbers.textContent = numbersHtml;
    }

    syncLineNumbersScroll() {
        const editor = document.getElementById('script-editor');
        const lineNumbers = document.getElementById('line-numbers');
        lineNumbers.scrollTop = editor.scrollTop;
    }

    updateEditorInfo() {
        const editor = document.getElementById('script-editor');
        const text = editor.value;
        const cursorPos = editor.selectionStart;
        
        // Calculate line and column
        const textBeforeCursor = text.substring(0, cursorPos);
        const lines = textBeforeCursor.split('\n');
        const line = lines.length;
        const column = lines[lines.length - 1].length + 1;
        
        document.getElementById('cursor-position').textContent = `Zeile ${line}, Spalte ${column}`;
        document.getElementById('char-count').textContent = `${text.length} Zeichen`;
    }

    handleEditorKeydown(e) {
        const editor = e.target;
        
        // Tab key for indentation
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            const spaces = '    '; // 4 spaces
            
            editor.value = editor.value.substring(0, start) + spaces + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + spaces.length;
            
            this.updateLineNumbers();
            this.autoSaveCurrentScript();
        }
        
        // Auto-close brackets and quotes
        const autoCloseChars = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'"
        };
        
        if (autoCloseChars[e.key]) {
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            
            if (start === end) { // No selection
                setTimeout(() => {
                    const newStart = start + 1;
                    editor.value = editor.value.substring(0, newStart) + autoCloseChars[e.key] + editor.value.substring(newStart);
                    editor.selectionStart = editor.selectionEnd = newStart;
                    this.updateLineNumbers();
                }, 0);
            }
        }
    }

    formatCode() {
        const editor = document.getElementById('script-editor');
        let code = editor.value;
        
        // Basic Python formatting
        const lines = code.split('\n');
        let formattedLines = [];
        let indentLevel = 0;
        
        for (let line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') {
                formattedLines.push('');
                continue;
            }
            
            // Decrease indent for elif, else, except, finally
            if (trimmedLine.startsWith('elif ') || trimmedLine.startsWith('else:') || 
                trimmedLine.startsWith('except') || trimmedLine.startsWith('finally:')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }
            
            // Add current line with proper indentation
            formattedLines.push('    '.repeat(indentLevel) + trimmedLine);
            
            // Increase indent after certain keywords
            if (trimmedLine.endsWith(':') && 
                (trimmedLine.startsWith('if ') || trimmedLine.startsWith('elif ') || 
                 trimmedLine.startsWith('else:') || trimmedLine.startsWith('for ') || 
                 trimmedLine.startsWith('while ') || trimmedLine.startsWith('def ') || 
                 trimmedLine.startsWith('class ') || trimmedLine.startsWith('try:') || 
                 trimmedLine.startsWith('except') || trimmedLine.startsWith('finally:'))) {
                indentLevel++;
            }
        }
        
        editor.value = formattedLines.join('\n');
        this.updateLineNumbers();
        this.autoSaveCurrentScript();
        this.showNotification('Code formatiert!', 'success');
    }

    clearEditor() {
        if (confirm('Möchtest du den Editor wirklich leeren?')) {
            document.getElementById('script-editor').value = '';
            document.getElementById('script-name').value = '';
            this.updateLineNumbers();
            this.updateEditorInfo();
            this.autoSaveCurrentScript();
            this.showNotification('Editor geleert', 'info');
        }
    }

    // Script Execution
    runScript() {
        const editor = document.getElementById('script-editor');
        const output = document.getElementById('script-output');
        const code = editor.value.trim();
        
        if (!code) {
            this.showNotification('Kein Code zum Ausführen vorhanden', 'warning');
            return;
        }
        
        const startTime = performance.now();
        output.innerHTML = '<div class="output-running"><i class="fas fa-spinner fa-spin"></i> Code wird ausgeführt...</div>';
        
        setTimeout(() => {
            try {
                const result = this.simulatePythonExecution(code);
                const endTime = performance.now();
                this.lastRuntime = Math.round(endTime - startTime);
                
                output.innerHTML = `<pre class="output-content">${result}</pre>`;
                
                this.executionCount++;
                localStorage.setItem('script-execution-count', this.executionCount.toString());
                this.updateStats();
                
                this.showNotification('Script erfolgreich ausgeführt!', 'success');
            } catch (error) {
                output.innerHTML = `<div class="output-error"><i class="fas fa-exclamation-triangle"></i> Fehler: ${error.message}</div>`;
                this.showNotification('Fehler beim Ausführen des Scripts', 'error');
            }
        }, 500); // Simulate execution delay
    }

    simulatePythonExecution(code) {
        let output = '';
        const lines = code.split('\n');
        const variables = {};
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            // Handle print statements
            if (trimmed.startsWith('print(')) {
                const match = trimmed.match(/print\(([^)]+)\)/);
                if (match) {
                    let content = match[1];
                    
                    // Handle string literals
                    if (content.startsWith('"') && content.endsWith('"')) {
                        output += content.slice(1, -1) + '\n';
                    } else if (content.startsWith("'") && content.endsWith("'")) {
                        output += content.slice(1, -1) + '\n';
                    } else if (content.startsWith('f"') || content.startsWith("f'")) {
                        // Basic f-string support
                        let fstring = content.slice(2, -1);
                        Object.keys(variables).forEach(varName => {
                            fstring = fstring.replace(new RegExp(`{${varName}}`, 'g'), variables[varName]);
                        });
                        output += fstring + '\n';
                    } else {
                        // Try to evaluate as variable or expression
                        if (variables[content]) {
                            output += variables[content] + '\n';
                        } else {
                            output += content + '\n';
                        }
                    }
                }
            }
            
            // Handle variable assignments
            if (trimmed.includes('=') && !trimmed.includes('==') && !trimmed.includes('!=')) {
                const parts = trimmed.split('=');
                if (parts.length === 2) {
                    const varName = parts[0].trim();
                    let value = parts[1].trim();
                    
                    // Handle string values
                    if (value.startsWith('"') && value.endsWith('"')) {
                        variables[varName] = value.slice(1, -1);
                    } else if (value.startsWith("'") && value.endsWith("'")) {
                        variables[varName] = value.slice(1, -1);
                    } else if (!isNaN(value)) {
                        variables[varName] = parseFloat(value);
                    } else {
                        variables[varName] = value;
                    }
                }
            }
            
            // Handle for loops (basic)
            if (trimmed.startsWith('for ') && trimmed.includes('range(')) {
                const rangeMatch = trimmed.match(/range\((\d+)\)/);
                if (rangeMatch) {
                    const count = parseInt(rangeMatch[1]);
                    output += `# For-Schleife mit ${count} Iterationen ausgeführt\n`;
                }
            }
            
            // Handle function definitions
            if (trimmed.startsWith('def ')) {
                const funcMatch = trimmed.match(/def\s+(\w+)/);
                if (funcMatch) {
                    output += `# Funktion '${funcMatch[1]}' definiert\n`;
                }
            }
        }
        
        if (!output.trim()) {
            output = '# Script erfolgreich ausgeführt (keine Ausgabe generiert)\n';
        }
        
        return output + '\n--- Ausführung beendet ---';
    }

    clearOutput() {
        const output = document.getElementById('script-output');
        output.innerHTML = '<div class="output-placeholder"><i class="fas fa-play-circle"></i><p>Führe ein Script aus, um die Ausgabe hier zu sehen</p></div>';
    }

    copyOutput() {
        const output = document.getElementById('script-output');
        const text = output.textContent || output.innerText;
        
        if (!text || text.includes('Führe ein Script aus')) {
            this.showNotification('Keine Ausgabe zum Kopieren vorhanden', 'warning');
            return;
        }
        
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Ausgabe in Zwischenablage kopiert!', 'success');
        }).catch(() => {
            this.showNotification('Fehler beim Kopieren', 'error');
        });
    }

    // Script Management
    autoSaveCurrentScript() {
        const editor = document.getElementById('script-editor');
        const scriptName = document.getElementById('script-name');
        
        const currentScript = {
            name: scriptName.value || 'Unbenannt',
            code: editor.value,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('productivity-current-script', JSON.stringify(currentScript));
    }

    loadCurrentScript() {
        const saved = localStorage.getItem('productivity-current-script');
        if (saved) {
            try {
                const script = JSON.parse(saved);
                document.getElementById('script-editor').value = script.code || '';
                document.getElementById('script-name').value = script.name !== 'Unbenannt' ? script.name : '';
                this.updateLineNumbers();
                this.updateEditorInfo();
            } catch (e) {
                console.error('Error loading current script:', e);
            }
        }
    }

    openSaveDialog() {
        const editor = document.getElementById('script-editor');
        const scriptName = document.getElementById('script-name');
        
        if (!editor.value.trim()) {
            this.showNotification('Kein Code zum Speichern vorhanden', 'warning');
            return;
        }
        
        document.getElementById('save-script-name').value = scriptName.value || '';
        document.getElementById('save-script-description').value = '';
        this.openModal('save-script-modal');
    }

    confirmSaveScript() {
        const editor = document.getElementById('script-editor');
        const name = document.getElementById('save-script-name').value.trim();
        const description = document.getElementById('save-script-description').value.trim();
        
        if (!name) {
            this.showNotification('Bitte einen Namen eingeben', 'warning');
            return;
        }
        
        const script = {
            id: Date.now(),
            name: name,
            description: description,
            code: editor.value,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.savedScripts.unshift(script);
        this.saveSavedScripts();
        this.renderSavedScripts();
        this.updateStats();
        this.closeModal('save-script-modal');
        
        // Update script name in editor
        document.getElementById('script-name').value = name;
        this.autoSaveCurrentScript();
        
        this.showNotification('Script gespeichert!', 'success');
    }

    loadScript(id) {
        const script = this.savedScripts.find(s => s.id === id);
        if (!script) return;
        
        document.getElementById('script-editor').value = script.code;
        document.getElementById('script-name').value = script.name;
        this.updateLineNumbers();
        this.updateEditorInfo();
        this.autoSaveCurrentScript();
        this.switchTab('editor');
        
        this.showNotification(`Script "${script.name}" geladen`, 'success');
    }

    deleteScript(id) {
        const script = this.savedScripts.find(s => s.id === id);
        if (!script) return;
        
        if (confirm(`Möchtest du das Script "${script.name}" wirklich löschen?`)) {
            this.savedScripts = this.savedScripts.filter(s => s.id !== id);
            this.saveSavedScripts();
            this.renderSavedScripts();
            this.updateStats();
            this.showNotification('Script gelöscht', 'info');
        }
    }

    exportScript(id) {
        const script = this.savedScripts.find(s => s.id === id);
        if (!script) return;
        
        const data = {
            script: script,
            exported: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${script.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Script exportiert!', 'success');
    }

    exportAllScripts() {
        if (this.savedScripts.length === 0) {
            this.showNotification('Keine Scripts zum Exportieren vorhanden', 'info');
            return;
        }
        
        const data = {
            scripts: this.savedScripts,
            exported: new Date().toISOString(),
            count: this.savedScripts.length
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scripts-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Alle Scripts exportiert!', 'success');
    }

    importScript() {
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
                        
                        if (data.script) {
                            // Single script import
                            const script = {
                                ...data.script,
                                id: Date.now(),
                                importedAt: new Date().toISOString()
                            };
                            this.savedScripts.unshift(script);
                            this.showNotification(`Script "${script.name}" importiert!`, 'success');
                        } else if (data.scripts) {
                            // Multiple scripts import
                            const importedScripts = data.scripts.map(script => ({
                                ...script,
                                id: Date.now() + Math.random(),
                                importedAt: new Date().toISOString()
                            }));
                            this.savedScripts.unshift(...importedScripts);
                            this.showNotification(`${importedScripts.length} Scripts importiert!`, 'success');
                        } else {
                            throw new Error('Invalid format');
                        }
                        
                        this.saveSavedScripts();
                        this.renderSavedScripts();
                        this.updateStats();
                    } catch (error) {
                        this.showNotification('Fehler beim Importieren der Scripts', 'error');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    loadTemplate(templateIndex) {
        const template = this.templates[templateIndex];
        if (!template) return;
        
        document.getElementById('script-editor').value = template.code;
        document.getElementById('script-name').value = template.name;
        this.updateLineNumbers();
        this.updateEditorInfo();
        this.autoSaveCurrentScript();
        this.switchTab('editor');
        
        this.showNotification(`Vorlage "${template.name}" geladen`, 'success');
    }

    // Rendering
    renderSavedScripts() {
        const container = document.getElementById('saved-scripts-list');
        const countElement = document.getElementById('saved-count');
        
        countElement.textContent = this.savedScripts.length;
        
        if (this.savedScripts.length === 0) {
            container.innerHTML = '<div class="empty-state"><i class="fas fa-code"></i><h3>Noch keine gespeicherten Scripts</h3><p>Speichere dein erstes Script, um es hier zu sehen!</p></div>';
            return;
        }
        
        container.innerHTML = this.savedScripts.map(script => `
            <div class="saved-script-card" data-id="${script.id}">
                <div class="script-header">
                    <h4 class="script-name">${this.escapeHtml(script.name)}</h4>
                    <div class="script-actions">
                        <button class="script-action-btn" onclick="scriptRunner.loadScript(${script.id})" title="Laden">
                            <i class="fas fa-upload"></i>
                        </button>
                        <button class="script-action-btn" onclick="scriptRunner.exportScript(${script.id})" title="Exportieren">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="script-action-btn delete" onclick="scriptRunner.deleteScript(${script.id})" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                ${script.description ? `<div class="script-description">${this.escapeHtml(script.description)}</div>` : ''}
                <div class="script-meta">
                    <span class="script-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(script.createdAt)}
                    </span>
                    <span class="script-lines">
                        <i class="fas fa-list-ol"></i>
                        ${script.code.split('\n').length} Zeilen
                    </span>
                </div>
                <div class="script-preview">
                    <pre><code>${this.escapeHtml(this.truncateCode(script.code, 100))}</code></pre>
                </div>
            </div>
        `).join('');
    }

    renderTemplates() {
        const container = document.getElementById('templates-grid');
        
        container.innerHTML = this.templates.map((template, index) => `
            <div class="template-card" onclick="scriptRunner.loadTemplate(${index})">
                <div class="template-header">
                    <h4 class="template-name">${template.name}</h4>
                    <i class="fas fa-file-code template-icon"></i>
                </div>
                <div class="template-description">${template.description}</div>
                <div class="template-preview">
                    <pre><code>${this.escapeHtml(this.truncateCode(template.code, 80))}</code></pre>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const totalScripts = this.savedScripts.length;
        const totalLines = this.savedScripts.reduce((sum, script) => sum + script.code.split('\n').length, 0);
        
        document.getElementById('total-scripts').textContent = totalScripts;
        document.getElementById('executed-count').textContent = this.executionCount;
        document.getElementById('total-lines').textContent = totalLines.toLocaleString();
        document.getElementById('last-runtime').textContent = `${this.lastRuntime}ms`;
    }

    // Storage
    saveSavedScripts() {
        localStorage.setItem('productivity-scripts', JSON.stringify(this.savedScripts));
    }

    // Modal Management
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
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

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : type === 'error' ? 'times-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

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

    truncateCode(code, maxLength) {
        if (code.length <= maxLength) return code;
        return code.substring(0, maxLength) + '...';
    }
}

// Initialize the script runner
const scriptRunner = new ScriptRunner();