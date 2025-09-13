class PalmTodoApp {
    constructor() {
        this.tasks = [];
        this.selectedTaskId = null;
        this.currentCategory = 'all';
        this.categories = {
            'all': 'Toutes',
            'unfiled': 'Non classé', 
            'personal': 'Personnel',
            'business': 'Professionnel',
            'work': 'Travail'
        };
        this.taskCategories = ['Bureau', 'Domicile', 'Non classé'];
        this.selectedCategoryInManager = null;
        this.preferences = {
            sortBy: 'priority',
            showCompleted: true,
            showDueOnly: false,
            recordCompletion: false,
            showDueDates: false,
            showPriorities: true,
            showCategories: false
        };
        this.settings = {
            backgroundColor: 'default',
            language: 'fr'
        };
        this.translations = {
            fr: {
                taskList: 'Liste des tâches',
                all: 'Toutes',
                new: 'Nouv.',
                details: 'Détails...',
                show: 'Afficher...',
                settings: 'Réglages',
                bgColor: 'Couleur de fond:',
                language: 'Langue:',
                backup: 'Sauvegarde:',
                backupBtn: 'Sauvegarder',
                restoreBtn: 'Restaurer',
                backupSuccess: 'Sauvegarde réussie',
                restoreSuccess: 'Restauration réussie',
                restoreError: 'Erreur de restauration',
                defaultColor: 'Défaut (vert)',
                white: 'Blanc',
                black: 'Noir',
                ok: 'OK',
                cancel: 'Annuler'
            },
            en: {
                taskList: 'Task List',
                all: 'All',
                new: 'New',
                details: 'Details...',
                show: 'Show...',
                settings: 'Settings',
                bgColor: 'Background color:',
                language: 'Language:',
                backup: 'Backup:',
                backupBtn: 'Backup',
                restoreBtn: 'Restore',
                backupSuccess: 'Backup successful',
                restoreSuccess: 'Restore successful',
                restoreError: 'Restore error',
                defaultColor: 'Default (green)',
                white: 'White',
                black: 'Black',
                ok: 'OK',
                cancel: 'Cancel'
            }
        };
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderTasks();
        this.checkInstallStatus();
    }

    loadData() {
        const savedTasks = localStorage.getItem('palm_todo_tasks');
        const savedPrefs = localStorage.getItem('palm_todo_prefs');
        const savedCategories = localStorage.getItem('palm_todo_categories');
        const savedSettings = localStorage.getItem('palm_todo_settings');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedPrefs) {
            this.preferences = { ...this.preferences, ...JSON.parse(savedPrefs) };
        }
        
        if (savedCategories) {
            this.taskCategories = JSON.parse(savedCategories);
        }
        
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            this.applySettings();
        }
    }

    saveData() {
        localStorage.setItem('palm_todo_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('palm_todo_prefs', JSON.stringify(this.preferences));
        localStorage.setItem('palm_todo_categories', JSON.stringify(this.taskCategories));
        localStorage.setItem('palm_todo_settings', JSON.stringify(this.settings));
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    setupEventListeners() {
        // Settings button
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettingsDialog();
        });

        // Category selector
        document.getElementById('category-selector').addEventListener('click', () => {
            this.toggleCategoryDropdown();
        });

        // Note: Category menu items are now handled dynamically in updateMainCategoryDropdown()

        // Bottom buttons
        document.getElementById('new-btn').addEventListener('click', () => {
            this.addNewTask();
        });

        document.getElementById('details-btn').addEventListener('click', () => {
            this.showTaskDetails();
        });

        document.getElementById('show-btn').addEventListener('click', () => {
            this.showPreferences();
        });

        // Detail dialog
        document.getElementById('ok-btn').addEventListener('click', () => {
            this.saveTaskDetail();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideDialog('detail-dialog');
        });

        document.getElementById('delete-btn').addEventListener('click', () => {
            this.deleteSelectedTask();
        });

        document.getElementById('note-btn').addEventListener('click', () => {
            this.showNoteInput();
        });

        // Priority buttons
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        // Preferences dialog
        document.getElementById('prefs-ok').addEventListener('click', () => {
            this.savePreferences();
        });

        document.getElementById('prefs-cancel').addEventListener('click', () => {
            this.hideDialog('prefs-dialog');
        });

        // Alert dialog
        document.getElementById('alert-ok').addEventListener('click', () => {
            this.hideDialog('selection-alert');
        });

        // Note input
        document.getElementById('note-save').addEventListener('click', () => {
            this.saveNote();
        });

        document.getElementById('note-cancel').addEventListener('click', () => {
            this.hideDialog('note-input');
        });

        // Dialog close buttons
        document.querySelectorAll('.dialog-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const dialog = e.target.closest('.palm-dialog');
                this.hideDialog(dialog.id);
            });
        });

        // Detail dropdowns - use event delegation
        document.addEventListener('click', (e) => {
            const categoryBtn = e.target.closest('#detail-category-btn');
            const dateBtn = e.target.closest('.date-dropdown');
            
            if (categoryBtn) {
                console.log('Category button clicked');
                e.stopPropagation();
                this.showDetailCategoryMenu();
                return;
            }
            if (dateBtn) {
                console.log('Date button clicked');
                e.stopPropagation();
                this.showDateMenu();
                return;
            }
        });

        // Category manager
        document.getElementById('cat-ok').addEventListener('click', () => {
            this.hideDialog('category-manager');
        });

        document.getElementById('cat-new').addEventListener('click', () => {
            this.addNewCategory();
        });

        document.getElementById('cat-rename').addEventListener('click', () => {
            this.renameSelectedCategory();
        });

        document.getElementById('cat-delete').addEventListener('click', () => {
            this.deleteSelectedCategory();
        });

        // Calendar
        document.getElementById('prev-year').addEventListener('click', () => {
            this.changeCalendarYear(-1);
        });

        document.getElementById('next-year').addEventListener('click', () => {
            this.changeCalendarYear(1);
        });

        document.getElementById('calendar-cancel').addEventListener('click', () => {
            this.hideDialog('date-picker');
        });

        document.getElementById('calendar-today').addEventListener('click', () => {
            this.selectCalendarToday();
        });

        // Click anywhere to close menus (separate listener)
        document.addEventListener('click', (e) => {
            // Don't close if clicking on dropdown triggers
            if (e.target.closest('#detail-category-btn') || e.target.closest('.date-dropdown')) {
                return;
            }
            
            if (!e.target.closest('.category-selector') && !e.target.closest('#category-dropdown')) {
                this.hideCategoryDropdown();
            }
            if (!e.target.closest('#detail-category-menu')) {
                this.hideDetailCategoryMenu();
            }
            if (!e.target.closest('#detail-date-menu')) {
                this.hideDetailDateMenu();
            }
        });
    }

    toggleCategoryDropdown() {
        // Update the main category dropdown with actual task categories
        this.updateMainCategoryDropdown();
        const dropdown = document.getElementById('category-dropdown');
        dropdown.classList.toggle('hidden');
    }

    updateMainCategoryDropdown() {
        const dropdown = document.getElementById('category-dropdown');
        const list = dropdown.querySelector('.dropdown-list');
        list.innerHTML = '';

        // Add "Toutes" option
        const allItem = document.createElement('div');
        allItem.className = 'dropdown-item';
        if (this.currentCategory === 'all') allItem.classList.add('selected');
        allItem.dataset.category = 'all';
        allItem.textContent = 'Toutes';
        allItem.addEventListener('click', (e) => {
            this.selectCategory('all', 'Toutes');
        });
        list.appendChild(allItem);

        // Add actual task categories
        this.taskCategories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            const categoryKey = cat.toLowerCase().replace(/\s+/g, '_');
            if (this.currentCategory === categoryKey) item.classList.add('selected');
            item.dataset.category = categoryKey;
            item.textContent = cat;
            item.addEventListener('click', (e) => {
                this.selectCategory(categoryKey, cat);
            });
            list.appendChild(item);
        });
    }

    hideCategoryDropdown() {
        document.getElementById('category-dropdown').classList.add('hidden');
    }

    selectCategory(category, text) {
        this.currentCategory = category;
        document.getElementById('current-category').textContent = text;
        
        // Update selected state
        document.querySelectorAll('.dropdown-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('selected');
        
        this.hideCategoryDropdown();
        this.renderTasks();
    }

    addNewTask() {
        const newTask = {
            id: this.generateId(),
            text: 'Nouvelle tâche',
            priority: 3,
            category: 'Non classé',
            dueDate: '',
            completed: false,
            personal: false,
            note: '',
            createdAt: new Date().toISOString()
        };
        
        this.tasks.push(newTask);
        this.selectedTaskId = newTask.id;
        this.saveData();
        this.renderTasks();
    }

    showPriorityDropdown(task, priorityElement) {
        // Remove any existing dropdown
        const existingDropdown = document.querySelector('.priority-inline-dropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }

        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'priority-inline-dropdown';
        
        // Position dropdown relative to priority element
        const rect = priorityElement.getBoundingClientRect();
        dropdown.style.position = 'absolute';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.top = (rect.bottom + 2) + 'px';
        dropdown.style.minWidth = '20px';
        dropdown.style.width = 'auto';
        dropdown.style.background = 'var(--palm-green)';
        dropdown.style.border = '2px solid var(--palm-dark)';
        dropdown.style.boxShadow = '2px 2px 0 var(--palm-shadow)';
        dropdown.style.zIndex = '1000';

        // Add priority options
        for (let i = 1; i <= 5; i++) {
            const option = document.createElement('div');
            option.className = 'priority-option';
            option.textContent = i;
            option.style.padding = '2px 4px';
            option.style.textAlign = 'center';
            option.style.cursor = 'pointer';
            option.style.borderBottom = '1px solid var(--palm-dark)';
            
            if (i === (task.priority || 3)) {
                option.style.background = 'var(--palm-dark)';
                option.style.color = 'var(--palm-green)';
            }

            option.addEventListener('click', (e) => {
                e.stopPropagation();
                task.priority = i;
                this.saveData();
                this.renderTasks();
                dropdown.remove();
            });

            option.addEventListener('mouseenter', () => {
                if (i !== (task.priority || 3)) {
                    option.style.background = 'var(--palm-light)';
                }
            });

            option.addEventListener('mouseleave', () => {
                if (i !== (task.priority || 3)) {
                    option.style.background = 'var(--palm-green)';
                }
            });

            dropdown.appendChild(option);
        }

        // Remove last border
        if (dropdown.lastChild) {
            dropdown.lastChild.style.borderBottom = 'none';
        }

        document.body.appendChild(dropdown);

        // Close dropdown when clicking outside
        const closeDropdown = (e) => {
            if (!dropdown.contains(e.target) && e.target !== priorityElement) {
                dropdown.remove();
                document.removeEventListener('click', closeDropdown);
            }
        };
        
        setTimeout(() => {
            document.addEventListener('click', closeDropdown);
        }, 0);
    }

    showTaskDetails() {
        if (!this.selectedTaskId) {
            this.showSelectionAlert();
            return;
        }

        const task = this.tasks.find(t => t.id === this.selectedTaskId);
        if (!task) return;

        // Fill dialog with task data
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.classList.toggle('selected', btn.dataset.priority == task.priority);
        });

        document.getElementById('detail-category-text').textContent = task.category || 'Non classé';
        
        // Format due date for display
        let dueDateText = 'Sans date';
        if (task.dueDate) {
            const date = new Date(task.dueDate);
            dueDateText = date.toLocaleDateString('fr-FR');
        }
        document.querySelector('.date-dropdown span').textContent = dueDateText;
        this.currentTaskDueDate = task.dueDate || '';
        
        document.querySelector('.palm-checkbox').checked = task.personal;

        this.showDialog('detail-dialog');
    }

    saveTaskDetail() {
        if (!this.selectedTaskId) return;

        const task = this.tasks.find(t => t.id === this.selectedTaskId);
        if (!task) return;

        const selectedPriority = document.querySelector('.priority-btn.selected');
        task.priority = selectedPriority ? parseInt(selectedPriority.dataset.priority) : 3;
        task.personal = document.querySelector('.palm-checkbox').checked;
        task.category = document.getElementById('detail-category-text').textContent;
        task.dueDate = this.currentTaskDueDate || '';

        this.saveData();
        this.renderTasks();
        this.hideDialog('detail-dialog');
    }

    deleteSelectedTask() {
        if (!this.selectedTaskId) return;

        this.tasks = this.tasks.filter(t => t.id !== this.selectedTaskId);
        this.selectedTaskId = null;
        this.saveData();
        this.renderTasks();
        this.hideDialog('detail-dialog');
    }

    showNoteInput() {
        if (!this.selectedTaskId) return;

        const task = this.tasks.find(t => t.id === this.selectedTaskId);
        if (!task) return;

        document.getElementById('task-note-field').value = task.note || '';
        this.hideDialog('detail-dialog');
        this.showDialog('note-input');
    }

    saveNote() {
        if (!this.selectedTaskId) return;

        const task = this.tasks.find(t => t.id === this.selectedTaskId);
        if (!task) return;

        task.note = document.getElementById('task-note-field').value;
        this.saveData();
        this.renderTasks();
        this.hideDialog('note-input');
    }

    showPreferences() {
        // Fill preferences dialog
        document.getElementById('show-completed').checked = this.preferences.showCompleted;
        document.getElementById('show-due-only').checked = this.preferences.showDueOnly;
        document.getElementById('record-completion').checked = this.preferences.recordCompletion;
        document.getElementById('show-due-dates').checked = this.preferences.showDueDates;
        document.getElementById('show-priorities').checked = this.preferences.showPriorities;
        document.getElementById('show-categories').checked = this.preferences.showCategories;

        this.showDialog('prefs-dialog');
    }

    savePreferences() {
        this.preferences.showCompleted = document.getElementById('show-completed').checked;
        this.preferences.showDueOnly = document.getElementById('show-due-only').checked;
        this.preferences.recordCompletion = document.getElementById('record-completion').checked;
        this.preferences.showDueDates = document.getElementById('show-due-dates').checked;
        this.preferences.showPriorities = document.getElementById('show-priorities').checked;
        this.preferences.showCategories = document.getElementById('show-categories').checked;

        this.saveData();
        this.renderTasks();
        this.hideDialog('prefs-dialog');
    }

    showSelectionAlert() {
        this.showDialog('selection-alert');
    }

    showDialog(dialogId) {
        document.getElementById(dialogId).classList.remove('hidden');
    }

    hideDialog(dialogId) {
        document.getElementById(dialogId).classList.add('hidden');
    }

    getFilteredTasks() {
        let filtered = [...this.tasks];

        // Filter by category
        if (this.currentCategory !== 'all') {
            // Find the actual category name
            const categoryName = this.taskCategories.find(cat => 
                cat.toLowerCase().replace(/\s+/g, '_') === this.currentCategory
            );
            if (categoryName) {
                filtered = filtered.filter(t => t.category === categoryName);
            }
        }

        // Filter by preferences
        if (!this.preferences.showCompleted) {
            filtered = filtered.filter(t => !t.completed);
        }

        if (this.preferences.showDueOnly) {
            filtered = filtered.filter(t => t.dueDate);
        }

        // Sort tasks
        filtered.sort((a, b) => {
            if (this.preferences.sortBy === 'priority') {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                if (a.dueDate && b.dueDate) {
                    return a.dueDate.localeCompare(b.dueDate);
                }
                return a.dueDate ? -1 : 1;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        return filtered;
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        const tasks = this.getFilteredTasks();

        taskList.innerHTML = '';

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            if (task.id === this.selectedTaskId) {
                li.classList.add('selected');
            }
            if (task.completed) {
                li.classList.add('completed');
            }

            // Checkbox
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                task.completed = checkbox.checked;
                if (task.completed && this.preferences.recordCompletion) {
                    task.completedAt = new Date().toISOString();
                }
                this.saveData();
                this.renderTasks();
            });

            // Priority
            let priorityElement = null;
            if (this.preferences.showPriorities) {
                priorityElement = document.createElement('div');
                priorityElement.className = 'task-priority';
                priorityElement.textContent = task.priority || '3';
                priorityElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showPriorityDropdown(task, priorityElement);
                });
            }

            // Task text (editable)
            const textElement = document.createElement('div');
            textElement.className = 'task-text';
            textElement.textContent = task.text;
            
            // Make task selectable and text editable
            textElement.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Clear previous selection
                document.querySelectorAll('.task-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Select this task
                li.classList.add('selected');
                this.selectedTaskId = task.id;
                
                // Make text editable immediately on single click
                this.makeTextEditable(textElement, task, e);
            });

            // Note icon (paper icon)
            let noteIcon = null;
            if (task.note) {
                noteIcon = document.createElement('div');
                noteIcon.className = 'task-note-icon';
                noteIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectedTaskId = task.id;
                    this.showNoteInput();
                });
            }

            // Assemble task item
            li.appendChild(checkbox);
            if (priorityElement) {
                li.appendChild(priorityElement);
            }
            li.appendChild(textElement);
            if (noteIcon) {
                li.appendChild(noteIcon);
            }

            taskList.appendChild(li);
        });
    }

    makeTextEditable(textElement, task, clickEvent) {
        const currentText = textElement.textContent;
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'task-text-input';
        input.value = currentText;
        
        // Calculate approximate cursor position based on click
        let cursorPosition = currentText.length;
        if (clickEvent) {
            const rect = textElement.getBoundingClientRect();
            const clickX = clickEvent.clientX - rect.left;
            const textWidth = rect.width;
            const ratio = clickX / textWidth;
            cursorPosition = Math.round(currentText.length * ratio);
            cursorPosition = Math.max(0, Math.min(cursorPosition, currentText.length));
        }
        
        // Replace text with input
        textElement.replaceWith(input);
        input.focus();
        
        // Set cursor position instead of selecting all
        input.setSelectionRange(cursorPosition, cursorPosition);
        
        // Save on Enter or blur
        const saveText = () => {
            const newText = input.value.trim();
            if (newText) {
                task.text = newText;
                this.saveData();
            }
            
            // Replace input with text
            const newTextElement = document.createElement('div');
            newTextElement.className = 'task-text';
            newTextElement.textContent = task.text;
            
            // Re-add click listener
            newTextElement.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Clear previous selection
                document.querySelectorAll('.task-item').forEach(item => {
                    item.classList.remove('selected');
                });
                
                // Select this task
                const taskItem = newTextElement.closest('.task-item');
                taskItem.classList.add('selected');
                this.selectedTaskId = task.id;
                
                // Make text editable on double click
                if (e.detail === 2) {
                    this.makeTextEditable(newTextElement, task);
                }
            });
            
            input.replaceWith(newTextElement);
        };
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveText();
            }
        });
        
        input.addEventListener('blur', saveText);
        
        // Cancel on Escape
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const newTextElement = document.createElement('div');
                newTextElement.className = 'task-text';
                newTextElement.textContent = currentText;
                
                // Re-add click listener
                newTextElement.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Clear previous selection
                    document.querySelectorAll('.task-item').forEach(item => {
                        item.classList.remove('selected');
                    });
                    
                    // Select this task
                    const taskItem = newTextElement.closest('.task-item');
                    taskItem.classList.add('selected');
                    this.selectedTaskId = task.id;
                    
                    // Make text editable on double click
                    if (e.detail === 2) {
                        this.makeTextEditable(newTextElement, task);
                    }
                });
                
                input.replaceWith(newTextElement);
            }
        });
    }

    showDetailCategoryMenu() {
        console.log('showDetailCategoryMenu called');
        
        // Hide other menus first
        this.hideDetailDateMenu();
        
        // Update menu with current categories
        const menu = document.getElementById('detail-category-menu');
        if (!menu) {
            console.error('detail-category-menu not found');
            return;
        }
        
        const list = menu.querySelector('.dropdown-list');
        list.innerHTML = '';

        this.taskCategories.forEach(cat => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.dataset.category = cat.toLowerCase().replace(/\s+/g, '_');
            item.textContent = cat;
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectDetailCategory(e.target.dataset.category, e.target.textContent);
            });
            list.appendChild(item);
        });

        // Add Modif.Cat option
        const editItem = document.createElement('div');
        editItem.className = 'dropdown-item';
        editItem.dataset.category = 'edit';
        editItem.textContent = 'Modif.Cat';
        editItem.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showCategoryManager();
        });
        list.appendChild(editItem);

        menu.classList.remove('hidden');
        console.log('Category menu should now be visible', menu);
    }

    hideDetailCategoryMenu() {
        document.getElementById('detail-category-menu').classList.add('hidden');
    }

    selectDetailCategory(categoryKey, categoryText) {
        document.getElementById('detail-category-text').textContent = categoryText;
        this.hideDetailCategoryMenu();
    }

    showDateMenu() {
        console.log('showDateMenu called');
        
        // Hide other menus first
        this.hideDetailCategoryMenu();
        
        const menu = document.getElementById('detail-date-menu');
        if (!menu) {
            console.error('detail-date-menu not found');
            return;
        }
        
        const list = menu.querySelector('.dropdown-list');
        
        // Add event listeners to date items
        list.querySelectorAll('.dropdown-item').forEach(item => {
            // Remove old listeners by cloning
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectDetailDate(e.target.dataset.date, e.target.textContent);
            });
        });

        menu.classList.remove('hidden');
        console.log('Date menu should now be visible', menu);
    }

    hideDetailDateMenu() {
        document.getElementById('detail-date-menu').classList.add('hidden');
    }

    selectDetailDate(dateKey, dateText) {
        let dateValue = '';
        const today = new Date();
        
        switch(dateKey) {
            case 'today':
                dateValue = today.toISOString().split('T')[0];
                break;
            case 'tomorrow':
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                dateValue = tomorrow.toISOString().split('T')[0];
                break;
            case 'week':
                const nextWeek = new Date(today);
                nextWeek.setDate(nextWeek.getDate() + 7);
                dateValue = nextWeek.toISOString().split('T')[0];
                break;
            case 'custom':
                this.showCalendarPicker();
                return; // Don't close menu yet, wait for calendar selection
            default:
                dateValue = '';
                dateText = 'Sans date';
        }
        
        document.querySelector('.date-dropdown span').textContent = dateText;
        this.currentTaskDueDate = dateValue;
        this.hideDetailDateMenu();
    }

    showCategoryManager() {
        this.hideDetailCategoryMenu();
        this.updateCategoryManagerList();
        this.showDialog('category-manager');
    }

    updateCategoryManagerList() {
        const list = document.querySelector('.category-manager-list');
        list.innerHTML = '';

        this.taskCategories.forEach(cat => {
            if (cat !== 'Non classé') { // Don't show "Non classé" in manager
                const item = document.createElement('div');
                item.className = 'category-manager-item';
                item.textContent = cat;
                item.addEventListener('click', () => {
                    document.querySelectorAll('.category-manager-item').forEach(i => i.classList.remove('selected'));
                    item.classList.add('selected');
                    this.selectedCategoryInManager = cat;
                });
                list.appendChild(item);
            }
        });
    }

    addNewCategory() {
        const name = prompt('Nom de la nouvelle catégorie:');
        if (name && name.trim() && !this.taskCategories.includes(name.trim())) {
            this.taskCategories.push(name.trim());
            this.saveData();
            this.updateCategoryManagerList();
            // Update main dropdown too
            this.updateMainCategoryDropdown();
        }
    }

    renameSelectedCategory() {
        if (!this.selectedCategoryInManager) {
            alert('Sélectionnez une catégorie à renommer.');
            return;
        }

        const newName = prompt('Nouveau nom:', this.selectedCategoryInManager);
        if (newName && newName.trim() && newName.trim() !== this.selectedCategoryInManager) {
            const oldName = this.selectedCategoryInManager;
            const index = this.taskCategories.indexOf(oldName);
            this.taskCategories[index] = newName.trim();
            
            // Update tasks with old category
            this.tasks.forEach(task => {
                if (task.category === oldName) {
                    task.category = newName.trim();
                }
            });
            
            this.selectedCategoryInManager = null;
            this.saveData();
            this.updateCategoryManagerList();
            this.updateMainCategoryDropdown();
            this.renderTasks();
        }
    }

    deleteSelectedCategory() {
        if (!this.selectedCategoryInManager) {
            alert('Sélectionnez une catégorie à supprimer.');
            return;
        }

        if (confirm(`Supprimer la catégorie "${this.selectedCategoryInManager}"?`)) {
            const categoryToDelete = this.selectedCategoryInManager;
            
            // Move tasks to "Non classé"
            this.tasks.forEach(task => {
                if (task.category === categoryToDelete) {
                    task.category = 'Non classé';
                }
            });
            
            // Remove category
            this.taskCategories = this.taskCategories.filter(cat => cat !== categoryToDelete);
            this.selectedCategoryInManager = null;
            this.saveData();
            this.updateCategoryManagerList();
            this.updateMainCategoryDropdown();
            this.renderTasks();
        }
    }

    // Calendar functions
    showCalendarPicker() {
        const today = new Date();
        this.calendarYear = today.getFullYear();
        this.calendarMonth = today.getMonth();
        this.selectedCalendarDate = null;
        
        this.hideDetailDateMenu();
        this.updateCalendarDisplay();
        this.showDialog('date-picker');
    }

    changeCalendarYear(delta) {
        this.calendarYear += delta;
        document.getElementById('current-year').textContent = this.calendarYear;
        this.updateCalendarDays();
    }

    updateCalendarDisplay() {
        document.getElementById('current-year').textContent = this.calendarYear;
        
        // Update month selection
        document.querySelectorAll('.month-cell').forEach((cell, index) => {
            cell.classList.toggle('selected', index === this.calendarMonth);
            cell.onclick = () => {
                this.calendarMonth = index;
                document.querySelectorAll('.month-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                this.updateCalendarDays();
            };
        });
        
        this.updateCalendarDays();
    }

    updateCalendarDays() {
        const container = document.getElementById('calendar-days');
        container.innerHTML = '';
        
        // Add day headers
        const dayHeaders = ['l', 'm', 'm', 'j', 'v', 's', 'd'];
        dayHeaders.forEach(day => {
            const header = document.createElement('div');
            header.className = 'day-header';
            header.textContent = day;
            container.appendChild(header);
        });
        
        // Calculate first day of month and days in month
        const firstDay = new Date(this.calendarYear, this.calendarMonth, 1);
        const lastDay = new Date(this.calendarYear, this.calendarMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        let startDay = firstDay.getDay();
        startDay = startDay === 0 ? 6 : startDay - 1; // Convert to Monday = 0
        
        // Add empty cells for days before month starts
        for (let i = 0; i < startDay; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell other-month';
            const prevMonth = new Date(this.calendarYear, this.calendarMonth, 0);
            const prevDay = prevMonth.getDate() - startDay + i + 1;
            cell.textContent = prevDay;
            container.appendChild(cell);
        }
        
        // Add days of current month
        const today = new Date();
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell';
            cell.textContent = day;
            
            // Mark today
            if (this.calendarYear === today.getFullYear() && 
                this.calendarMonth === today.getMonth() && 
                day === today.getDate()) {
                cell.classList.add('today');
            }
            
            cell.onclick = () => {
                // Remove previous selection
                document.querySelectorAll('.day-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                this.selectedCalendarDate = day;
                
                // Auto-select date after brief delay
                setTimeout(() => {
                    this.confirmCalendarDate();
                }, 200);
            };
            
            container.appendChild(cell);
        }
        
        // Add empty cells to complete the grid
        const totalCells = container.children.length - 7; // Subtract headers
        const remainingCells = 42 - 7 - totalCells; // 6 weeks * 7 days - headers - current cells
        for (let i = 1; i <= remainingCells && totalCells + i <= 35; i++) {
            const cell = document.createElement('div');
            cell.className = 'day-cell other-month';
            cell.textContent = i;
            container.appendChild(cell);
        }
    }

    selectCalendarToday() {
        const today = new Date();
        this.calendarYear = today.getFullYear();
        this.calendarMonth = today.getMonth();
        this.selectedCalendarDate = today.getDate();
        this.confirmCalendarDate();
    }

    confirmCalendarDate() {
        if (this.selectedCalendarDate) {
            const selectedDate = new Date(this.calendarYear, this.calendarMonth, this.selectedCalendarDate);
            const dateValue = selectedDate.toISOString().split('T')[0];
            const dateText = selectedDate.toLocaleDateString('fr-FR');
            
            document.querySelector('.date-dropdown span').textContent = dateText;
            this.currentTaskDueDate = dateValue;
        }
        
        this.hideDialog('date-picker');
    }

    // Settings methods
    showSettingsDialog() {
        // Set current values
        document.getElementById('bg-color-select').value = this.settings.backgroundColor;
        document.getElementById('language-select').value = this.settings.language;
        
        // Add event listeners
        document.getElementById('settings-ok-btn').onclick = () => {
            this.saveSettings();
        };
        
        document.getElementById('settings-cancel-btn').onclick = () => {
            this.hideDialog('settings-dialog');
        };
        
        document.getElementById('backup-btn').onclick = () => {
            this.createBackup();
        };
        
        document.getElementById('restore-btn').onclick = () => {
            this.selectRestoreFile();
        };
        
        document.getElementById('restore-file-input').onchange = (e) => {
            this.restoreFromFile(e.target.files[0]);
        };
        
        this.showDialog('settings-dialog');
    }

    saveSettings() {
        const bgColor = document.getElementById('bg-color-select').value;
        const language = document.getElementById('language-select').value;
        
        this.settings.backgroundColor = bgColor;
        this.settings.language = language;
        
        this.saveData();
        this.applySettings();
        this.hideDialog('settings-dialog');
    }

    applySettings() {
        // Apply background color
        const body = document.body;
        const palmDevice = document.querySelector('.palm-device');
        const palmScreen = document.querySelector('.palm-screen');
        
        switch(this.settings.backgroundColor) {
            case 'white':
                body.style.background = '#ffffff';
                palmDevice.style.background = '#ffffff';
                palmScreen.style.background = '#ffffff';
                document.documentElement.style.setProperty('--palm-green', '#ffffff');
                document.documentElement.style.setProperty('--palm-light', '#f0f0f0');
                document.documentElement.style.setProperty('--palm-shadow', '#cccccc');
                break;
            case 'black':
                body.style.background = '#000000';
                palmDevice.style.background = '#000000';
                palmScreen.style.background = '#000000';
                document.documentElement.style.setProperty('--palm-green', '#000000');
                document.documentElement.style.setProperty('--palm-light', '#333333');
                document.documentElement.style.setProperty('--palm-shadow', '#666666');
                break;
            default:
                body.style.background = '#9b9e84';
                palmDevice.style.background = '#9b9e84';
                palmScreen.style.background = '#9b9e84';
                document.documentElement.style.setProperty('--palm-green', '#9b9e84');
                document.documentElement.style.setProperty('--palm-light', '#c6c8b5');
                document.documentElement.style.setProperty('--palm-shadow', '#6b6d5a');
                break;
        }
        
        // Apply language
        this.updateLanguage();
    }

    updateLanguage() {
        const t = this.translations[this.settings.language];
        
        // Update UI texts
        document.getElementById('header-title').textContent = t.taskList;
        document.getElementById('new-btn').textContent = t.new;
        document.getElementById('details-btn').textContent = t.details;
        document.getElementById('show-btn').textContent = t.show;
        
        // Update settings dialog
        document.getElementById('settings-title').textContent = t.settings;
        document.getElementById('bg-color-label').textContent = t.bgColor;
        document.getElementById('language-label').textContent = t.language;
        document.getElementById('backup-label').textContent = t.backup;
        document.getElementById('settings-ok-btn').textContent = t.ok;
        document.getElementById('settings-cancel-btn').textContent = t.cancel;
        
        // Update tooltips
        document.getElementById('backup-btn').title = t.backupBtn;
        document.getElementById('restore-btn').title = t.restoreBtn;
        
        // Update select options
        const bgSelect = document.getElementById('bg-color-select');
        bgSelect.options[0].text = t.defaultColor;
        bgSelect.options[1].text = t.white;
        bgSelect.options[2].text = t.black;
        
        // Update category if "All" is selected
        if (this.currentCategory === 'all') {
            document.getElementById('current-category').textContent = t.all;
        }
    }

    checkInstallStatus() {
        // Check if app is installed (running in standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.matchMedia('(display-mode: fullscreen)').matches ||
                           window.navigator.standalone === true;

        // Detect platform - only show on mobile devices
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

        // If not installed AND on mobile device, show install prompt after 2 seconds
        if (!isStandalone && isMobile) {
            setTimeout(() => {
                this.showInstallPrompt();
            }, 2000);
        }
    }

    showInstallPrompt() {
        // Don't show again if user already closed it
        if (localStorage.getItem('install_prompt_closed') === 'true') {
            return;
        }

        const installPrompt = document.getElementById('install-prompt');
        const closeBtn = document.getElementById('close-install-prompt');
        
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        const isEnglish = browserLang.toLowerCase().startsWith('en');
        
        // Update install prompt text based on language
        this.updateInstallPromptLanguage(isEnglish);
        
        // Detect platform
        const userAgent = navigator.userAgent || navigator.vendor || window.opera;
        
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            // iOS
            document.getElementById('ios-instructions').classList.remove('hidden');
        } else if (/android/i.test(userAgent)) {
            // Android
            document.getElementById('android-instructions').classList.remove('hidden');
        }
        
        // Show the prompt
        installPrompt.classList.remove('hidden');
        
        // Add close button handler
        closeBtn.onclick = () => {
            installPrompt.classList.add('hidden');
            // Remember that user closed the prompt
            localStorage.setItem('install_prompt_closed', 'true');
        };
    }

    updateInstallPromptLanguage(isEnglish) {
        const installContent = document.querySelector('.install-content h2');
        const iosTitle = document.querySelector('#ios-instructions h3');
        const androidTitle = document.querySelector('#android-instructions h3');
        const desktopTitle = document.querySelector('#desktop-instructions h3');
        const desktopText = document.querySelector('#desktop-instructions p');
        const closeBtn = document.getElementById('close-install-prompt');
        
        if (isEnglish) {
            // English translations
            installContent.textContent = 'Install PalmiTodo';
            if (iosTitle) iosTitle.textContent = 'On iOS (iPhone/iPad)';
            if (androidTitle) androidTitle.textContent = 'On Android';
            if (desktopTitle) desktopTitle.textContent = 'On Desktop';
            if (desktopText) desktopText.textContent = 'Click the install icon in the address bar or use the browser menu to install the app.';
            closeBtn.textContent = 'Close';
            
            // iOS instructions
            const iosSteps = document.querySelectorAll('#ios-instructions ol li');
            if (iosSteps[0]) iosSteps[0].innerHTML = 'Tap the <span class="icon-share">⎙</span> Share button';
            if (iosSteps[1]) iosSteps[1].innerHTML = 'Scroll down and tap "Add to Home Screen"';
            if (iosSteps[2]) iosSteps[2].innerHTML = 'Tap "Add"';
            
            // Android instructions
            const androidSteps = document.querySelectorAll('#android-instructions ol li');
            if (androidSteps[0]) androidSteps[0].innerHTML = 'Tap the menu <span class="icon-menu">⋮</span>';
            if (androidSteps[1]) androidSteps[1].innerHTML = 'Select "Install app" or "Add to Home screen"';
            if (androidSteps[2]) androidSteps[2].innerHTML = 'Confirm installation';
        } else {
            // French translations (default)
            installContent.textContent = 'Installer PalmiTodo';
            if (iosTitle) iosTitle.textContent = 'Sur iOS (iPhone/iPad)';
            if (androidTitle) androidTitle.textContent = 'Sur Android';
            if (desktopTitle) desktopTitle.textContent = 'Sur ordinateur';
            if (desktopText) desktopText.textContent = 'Cliquez sur l\'icône d\'installation dans la barre d\'adresse ou utilisez le menu du navigateur pour installer l\'application.';
            closeBtn.textContent = 'Fermer';
            
            // iOS instructions
            const iosSteps = document.querySelectorAll('#ios-instructions ol li');
            if (iosSteps[0]) iosSteps[0].innerHTML = 'Appuyez sur le bouton <span class="icon-share">⎙</span> Partager';
            if (iosSteps[1]) iosSteps[1].innerHTML = 'Faites défiler et appuyez sur "Sur l\'écran d\'accueil"';
            if (iosSteps[2]) iosSteps[2].innerHTML = 'Appuyez sur "Ajouter"';
            
            // Android instructions
            const androidSteps = document.querySelectorAll('#android-instructions ol li');
            if (androidSteps[0]) androidSteps[0].innerHTML = 'Appuyez sur le menu <span class="icon-menu">⋮</span>';
            if (androidSteps[1]) androidSteps[1].innerHTML = 'Sélectionnez "Installer l\'application" ou "Ajouter à l\'écran d\'accueil"';
            if (androidSteps[2]) androidSteps[2].innerHTML = 'Confirmez l\'installation';
        }
    }

    // Backup and Restore methods
    createBackup() {
        const t = this.translations[this.settings.language];
        
        try {
            // Create backup data (exclude settings)
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                tasks: this.tasks,
                preferences: this.preferences,
                taskCategories: this.taskCategories
            };
            
            // Create file and download
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `palmitodo-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            alert(t.backupSuccess);
            
        } catch (error) {
            console.error('Backup error:', error);
            alert('Erreur lors de la sauvegarde: ' + error.message);
        }
    }

    selectRestoreFile() {
        document.getElementById('restore-file-input').click();
    }

    async restoreFromFile(file) {
        const t = this.translations[this.settings.language];
        
        if (!file) return;
        
        try {
            const text = await file.text();
            const backupData = JSON.parse(text);
            
            // Validate backup format
            if (!backupData.version || !backupData.tasks) {
                throw new Error('Format de fichier invalide');
            }
            
            // Confirm restore
            const confirmMessage = this.settings.language === 'en' ? 
                'This will replace all your current tasks. Continue?' :
                'Ceci remplacera toutes vos tâches actuelles. Continuer ?';
                
            if (!confirm(confirmMessage)) {
                return;
            }
            
            // Restore data
            if (backupData.tasks) this.tasks = backupData.tasks;
            if (backupData.preferences) this.preferences = { ...this.preferences, ...backupData.preferences };
            if (backupData.taskCategories) this.taskCategories = backupData.taskCategories;
            
            // Reset selected task if it doesn't exist anymore
            if (!this.tasks.find(t => t.id === this.selectedTaskId)) {
                this.selectedTaskId = null;
            }
            
            // Save and refresh
            this.saveData();
            this.renderTasks();
            this.updateMainCategoryDropdown();
            
            alert(t.restoreSuccess);
            
        } catch (error) {
            console.error('Restore error:', error);
            alert(t.restoreError + ': ' + error.message);
        }
        
        // Reset file input
        document.getElementById('restore-file-input').value = '';
    }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new PalmTodoApp();
});