const Project = require('../models/Projects')
const { scopedProject } = require('../permission/project')
// @route   GET /api/projects
const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({ status: 'active' }).populate('members', 'name email');
        const userSpecificProjects = scopedProject(req.user, projects);
        res.json(userSpecificProjects)
    } catch (err) {
        res.status(500).json({ message: err.message })
    };
};


// @route   POST /api/projects
const createProject = async (req, res) => {
    try {
        const { name, description, members } = req.body;

        const project = new Project({
            name,
            description,
            members
        });

        const savedProject = await project.save();
        res.status(201).json(savedProject)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @route DElETE /api/projects/:projectId
const deleteProject = async (req, res) => {
    try {
        const id = req.params.projectId;
        const project = await Project.findByIdAndDelete(id);

        if (project == null) {
            return res.status(404).json({ message: 'Cannot find project' })
        }
        res.json({ message: 'Project deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//@route GET /api/projects/:projectId
const getOneProject = async (req, res) => {
    try {
        const id = req.params.projectId;
        const project = await Project.findById(id);

        if (project == null) {
            return res.status(404).json({ message: 'Cannot find project' })
        }
        res.json(project)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

// @desc    Get all members of a specific project
// @route   GET /api/projects/:projectId/members
const getProjectMembers = async (req, res) => {
    try {
        const project = await Project.findById(req.params.projectId).populate('members', 'name email role');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json(project.members);
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};




module.exports = {
    getProjects,
    createProject,
    deleteProject,
    getOneProject,
    getProjectMembers
}
