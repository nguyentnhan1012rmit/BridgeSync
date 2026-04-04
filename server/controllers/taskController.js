const Task = require('../models/Tasks')

// @route   GET /api/tasks/:projectId
const getTasksByProject = async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId }).populate('assigneeId', 'name').populate('reporterId', 'name');

        res.json(tasks)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @route   POST /api/tasks
const createTask = async (req, res) => {
    try {
        const { projectId, title, description, assigneeId } = req.body;

        if (!projectId || !title) {
            return res.status(400).json({ message: 'Project ID and Task Title are required.' });
        }

        const task = new Task({
            projectId,
            title,
            description,
            assigneeId,
            reporterId: req.user._id
        });

        const savedTask = await task.save();

        await savedTask.populate('assigneeId', 'name role');
        await savedTask.populate('reporterId', 'name role');
        res.status(201).json(savedTask)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @route   PUT /api/tasks/:taskId/status
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const task = await Task.findByIdAndUpdate(req.params.taskId, { status: status }, { new: true })

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

module.exports = {
    getTasksByProject,
    createTask,
    updateTaskStatus
}