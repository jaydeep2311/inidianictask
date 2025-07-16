const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');
const { Parser } = require('json2csv');

const router = express.Router();

router.get('/export', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    const fields = [
      { label: 'Task ID', value: '_id' },
      { label: 'Title', value: 'title' },
      { label: 'Status', value: 'status' },
      { label: 'Created Date', value: 'createdAt' },
      { label: 'Due Date', value: 'dueDate' },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(tasks);
    res.header('Content-Type', 'text/csv');
    res.attachment('tasks.csv');
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ message: 'CSV export failed' });
  }
});

module.exports = router; 