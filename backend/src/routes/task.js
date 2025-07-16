const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { sendMail } = require('./notify');
const User = require('../models/User');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const userId = req.user.id;
    const uploadDir = path.join(__dirname, '../../uploads', userId);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `task_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only PDF, DOCX, JPG files are allowed!'));
    }
    cb(null, true);
  },
});

// Create Task
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const file = req.file ? `/uploads/${req.user.id}/${req.file.filename}` : undefined;
    const task = new Task({
      user: req.user.id,
      title,
      description,
      status,
      dueDate,
      file,
    });
    await task.save();
    // Send email notification
    const user = await User.findById(req.user.id);
    await sendMail({
      to: user.email,
      subject: 'Task Created',
      text: `Task "${title}" has been created.`
    });
    res.status(201).json(task);
  } catch (err) {
    console.log({err})
    res.status(500).json({ message: 'Task creation failed' });
  }
});

// List Tasks with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, dueDate } = req.query;
    const filter = { user: req.user.id };
    if (status) filter.status = status;
    if (dueDate) filter.dueDate = { $eq: new Date(dueDate) };
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// Update Task
router.put('/:id', auth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const update = { title, description, status, dueDate };
    if (req.file) {
      update.file = `/uploads/${req.user.id}/${req.file.filename}`;
    }
    const task = await Task.findOneAndUpdate({ _id: req.params.id, user: req.user.id }, update, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    // Send email if completed
    if (status === 'Completed') {
      const user = await User.findById(req.user.id);
      await sendMail({
        to: user.email,
        subject: 'Task Completed',
        text: `Task "${task.title}" has been marked as completed.`
      });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: 'Task update failed' });
  }
});

// Delete Task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Task deletion failed' });
  }
});

module.exports = router; 