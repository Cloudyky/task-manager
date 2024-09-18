const { createApp, ref, onMounted, watch } = Vue;

createApp({
    setup() {
        const newTask = ref('');
        const responsible = ref('');
        const nextTaskId = ref(1);
        const tasks = ref({
            todo: [],
            inProgress: [],
            done: []
        });
        const editingTask = ref(null);
        const formTitle = ref('Create New Task');
        const submitButtonText = ref('Add Task');
        const targetColumn = ref('todo');

        const saveTasks = () => {
            localStorage.setItem('kanban-tasks', JSON.stringify(tasks.value));
            localStorage.setItem('kanban-next-task-id', nextTaskId.value);
        };

        const getCurrentDateTime = () => {
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        };

        console.log(getCurrentDateTime());
        

        const handleSubmit = () => {
            if (newTask.value.trim()) {
                if (editingTask.value) {
                    editingTask.value.text = newTask.value.trim();
                    if (targetColumn.value === 'inProgress') {
                        editingTask.value.responsible = responsible.value.trim();
                    }
                    editingTask.value = null;
                } else {
                    const newTaskObj = {
                        id: nextTaskId.value,
                        text: newTask.value.trim(),
                    };
                    
                    if (targetColumn.value === 'todo') {
                        tasks.value.todo.push(newTaskObj);
                    } else if (targetColumn.value === 'inProgress') {
                        newTaskObj.responsible = responsible.value.trim();
                        newTaskObj.startTime = getCurrentDateTime();
                        tasks.value.inProgress.push(newTaskObj);
                    }
                    nextTaskId.value++;
                }
                newTask.value = '';
                responsible.value = '';
                formTitle.value = 'Create New Task';
                submitButtonText.value = 'Add Task';
                targetColumn.value = 'todo';
                saveTasks();
            }
        };

        const editTask = (task, column) => {
            newTask.value = task.text;
            responsible.value = task.responsible || '';
            editingTask.value = task;
            formTitle.value = 'Update Task';
            submitButtonText.value = 'Update Task';
            targetColumn.value = column;
        };

        const cancelEdit = () => {
            newTask.value = '';
            responsible.value = '';
            editingTask.value = null;
            formTitle.value = 'Create New Task';
            submitButtonText.value = 'Add Task';
            targetColumn.value = 'todo';
        };

        const deleteTask = (taskId, column) => {
            tasks.value[column] = tasks.value[column].filter(task => task.id !== taskId);
            saveTasks();
        };

        const moveTaskToInProgress = (task) => {
            const responsibleName = window.prompt('Enter the name of the responsible person:');
            if (responsibleName) {
                deleteTask(task.id, 'todo');
                task.startTime = getCurrentDateTime();
                task.responsible = responsibleName;
                tasks.value.inProgress.push(task);
                saveTasks();
            }
        };

        const moveTaskToDone = (task) => {
            deleteTask(task.id, 'inProgress');
            task.endTime = getCurrentDateTime();
            tasks.value.done.push(task);
            saveTasks();
        };

        const initializeSortable = () => {
            const columns = [todoColumn.value, inProgressColumn.value, doneColumn.value];
            columns.forEach(column => {
                Sortable.create(column, {
                    group: 'kanban',
                    animation: 150,
                    onEnd: handleDragEnd
                });
            });
        };

        onMounted(() => {
            const savedTasks = localStorage.getItem('kanban-tasks');
            const savedTaskId = localStorage.getItem('kanban-next-task-id');
            if (savedTasks) {
                tasks.value = JSON.parse(savedTasks);
            }
            if (savedTaskId) {
                nextTaskId.value = parseInt(savedTaskId, 10);
            }
            initializeSortable();
        });

        watch(tasks, saveTasks, { deep: true });

        return {
            newTask,
            responsible,
            tasks,
            editingTask,
            formTitle,
            submitButtonText,
            targetColumn,
            handleSubmit,
            editTask,
            cancelEdit,
            deleteTask,
            moveTaskToInProgress,
            moveTaskToDone,
            getCurrentDateTime
        };
    }
}).mount('#app');
