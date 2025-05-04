const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Project = require('../models/Project');
const File = require('../models/File');

// Create a new project
router.post(
  '/',
  [
    auth,
    check('name', 'Project name is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description } = req.body;

    try {
      const project = new Project({
        user: req.user.id,
        name,
        description: description || '',
        files: [],
        chatHistory: [],
      });

      await project.save();
      res.status(201).json(project);
    } catch (err) {
      console.error('Error creating project:', err);
      res.status(500).json({ error: 'Server error creating project' });
    }
  }
);

// Get all projects for the user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user.id })
      .select('_id name description files chatHistory createdAt')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Server error fetching projects' });
  }
});

// Get a specific project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id })
      .populate('files', '_id filename columns createdAt hasVisualization lastVisualization');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (err) {
    console.error('Error fetching project:', err);
    res.status(500).json({ error: 'Server error fetching project' });
  }
});

// Delete a project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.user.id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Delete all associated files
    await File.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ msg: 'Project deleted successfully' });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ error: 'Server error deleting project' });
  }
});

module.exports = router;