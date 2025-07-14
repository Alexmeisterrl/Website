# Personal Productivity Hub

A modern, interactive web application for managing your productivity, ideas, projects, and scripts. Built with vanilla HTML, CSS, and JavaScript - no backend required!

## ✨ Features

### 🎯 Task Manager
- Priority-based task management (High, Medium, Low)
- Task filtering and completion tracking
- Progress statistics and analytics
- Bulk actions for completed tasks

### 📝 Notes Manager
- Categorized note-taking (Personal, Work, Ideas, To-Do, Other)
- Live search functionality
- Multiple sorting options
- Rich text support with preview

### 📊 Project Manager
- Full project lifecycle management
- Status tracking (Planning, Active, Completed, Paused, Cancelled)
- Deadline management with overdue detection
- Project details with descriptions and notes
- Grid and list view modes

### 💻 Script Runner
- Built-in Python code editor with syntax highlighting
- Code templates and examples
- Script saving and management
- Simulated Python execution environment
- Fullscreen coding mode

### 👤 Personal Info
- Customizable personal profile
- Skills and technology showcase
- Project portfolio display
- Goals and objectives tracking
- Contact links management

## 🎨 Design Features

- **Modern UI/UX** - Clean, professional interface based on contemporary design principles
- **Dark/Light Mode** - Automatic theme switching with user preference persistence
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Keyboard Shortcuts** - Power user features for enhanced productivity
- **Local Storage** - All data stored locally, no account or internet required

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/personal-productivity-hub.git
   cd personal-productivity-hub
   ```

2. **Open in browser**
   ```bash
   # Simply open index.html in your web browser
   # Or use a local server:
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

3. **Start being productive!**
   - Click on any feature card to get started
   - Customize your personal info
   - Add your first tasks and notes
   - Create your project portfolio

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Icons**: Font Awesome 6
- **Fonts**: Inter (Google Fonts)
- **Storage**: Browser LocalStorage
- **No Dependencies**: Pure vanilla JavaScript, no frameworks

## 📁 Project Structure

```
personal-productivity-hub/
├── index.html          # Main hub page
├── tasks.html          # Task management page
├── notes.html          # Notes management page
├── projects.html       # Project management page
├── scripts.html        # Script runner page
├── personal.html       # Personal info page
├── styles.css          # Global styles and themes
├── script.js           # Main hub functionality
├── tasks.js            # Task management logic
├── notes.js            # Notes management logic
├── projects.js         # Project management logic
├── scripts.js          # Script runner logic
├── personal.js         # Personal info logic
└── README.md           # This file
```

## ⌨️ Keyboard Shortcuts

### Global Shortcuts
- `Ctrl/Cmd + T` - Open Tasks
- `Ctrl/Cmd + N` - Open Notes  
- `Ctrl/Cmd + P` - Open Projects
- `Ctrl/Cmd + R` - Open Scripts
- `Escape` - Close modals/search

### Page-Specific Shortcuts
- **Tasks**: `Ctrl/Cmd + N` - New task, `Ctrl/Cmd + E` - Export
- **Notes**: `Ctrl/Cmd + F` - Search, `Ctrl/Cmd + E` - Export
- **Projects**: `Ctrl/Cmd + V` - Toggle view, `Ctrl/Cmd + E` - Export
- **Scripts**: `Ctrl/Cmd + Enter` - Run script, `Ctrl/Cmd + S` - Save script

## 💾 Data Management

### Export/Import
- Export individual sections or complete data backups
- JSON format for easy data portability
- Import data from previous exports

### Local Storage
- All data stored in browser's localStorage
- No server required, works completely offline
- Data persists between sessions

## 🎯 Use Cases

- **Personal Productivity** - Manage daily tasks and long-term goals
- **Project Portfolio** - Showcase your work and track progress  
- **Note-Taking** - Capture ideas and organize thoughts
- **Code Experimentation** - Test Python snippets and algorithms
- **Learning Tool** - Practice coding and project management

## 🔮 Future Enhancements

- [ ] Additional programming languages for script runner
- [ ] Calendar integration for deadlines
- [ ] Advanced markdown support in notes
- [ ] Project templates
- [ ] Data synchronization options
- [ ] Plugin system for extensions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Design inspiration from modern productivity applications
- Font Awesome for beautiful icons
- Google Fonts for typography
- Generated with assistance from Claude Code

---

**Built with ❤️ for productivity enthusiasts**