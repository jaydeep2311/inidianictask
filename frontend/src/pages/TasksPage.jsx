import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Paper, Stack, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import { Add, Edit, Delete, CloudDownload } from '@mui/icons-material';
import axios from '../api';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Completed', label: 'Completed' },
];

const initialForm = { title: '', description: '', status: 'Pending', dueDate: '', file: null };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTasks();
    const socket = io('/', { transports: ['websocket'] });
    socket.on('taskUpdated', fetchTasks);
    return () => socket.disconnect();
    // eslint-disable-next-line
  }, [status, dueDate]);

  const fetchTasks = async () => {
    const params = {};
    if (status) params.status = status;
    if (dueDate) params.dueDate = dueDate;
    const res = await axios.get('/api/tasks', { params });
    setTasks(res.data);
  };

  const handleExportCSV = async () => {
    const res = await axios.get('/api/csv/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'tasks.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleOpen = (task = null) => {
    if (task) {
      setForm({ ...task, file: null });
      setEditId(task._id);
    } else {
      setForm(initialForm);
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(initialForm);
    setEditId(null);
  };

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'file') setForm(f => ({ ...f, file: files[0] }));
    else setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') formData.append(k, v);
    });
    try {
      if (editId) {
        await axios.put(`/api/tasks/${editId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Task updated', severity: 'success' });
      } else {
        await axios.post('/api/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setSnackbar({ open: true, message: 'Task created', severity: 'success' });
      }
      handleClose();
      fetchTasks();
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving task', severity: 'error' });
    }
  };

  const handleDelete = async id => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
      setDeleteId(null);
      fetchTasks();
    } catch {
      setSnackbar({ open: true, message: 'Error deleting task', severity: 'error' });
    }
  };

  return (
    <Box mt={4}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" mb={2}>Tasks</Typography>
        <Stack direction="row" spacing={2} mb={2}>
          <TextField select label="Status" value={status} onChange={e => setStatus(e.target.value)} sx={{ minWidth: 120 }}>
            {statusOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
          <TextField label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} />
          <Button variant="outlined" onClick={handleExportCSV} startIcon={<CloudDownload />}>Export CSV</Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>Add Task</Button>
        </Stack>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>File</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map(task => (
                <TableRow key={task._id}>
                  <TableCell>{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>{task.status}</TableCell>
                  <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell>
                    {task.file && <a href={task.file} target="_blank" rel="noopener noreferrer">Download</a>}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpen(task)}><Edit /></IconButton>
                    <IconButton color="error" onClick={() => setDeleteId(task._id)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Create/Edit Task Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>{editId ? 'Edit Task' : 'Add Task'}</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField label="Title" name="title" value={form.title} onChange={handleChange} fullWidth margin="normal" required />
              <TextField label="Description" name="description" value={form.description} onChange={handleChange} fullWidth margin="normal" />
              <TextField select label="Status" name="status" value={form.status} onChange={handleChange} fullWidth margin="normal">
                {statusOptions.filter(opt => opt.value).map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
              <TextField label="Due Date" name="dueDate" type="date" value={form.dueDate ? form.dueDate.slice(0,10) : ''} onChange={handleChange} InputLabelProps={{ shrink: true }} fullWidth margin="normal" />
              <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                {form.file ? form.file.name : 'Upload File'}
                <input type="file" name="file" hidden accept=".pdf,.docx,image/jpeg,image/jpg" onChange={handleChange} />
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>Cancel</Button>
              <Button type="submit" variant="contained">{editId ? 'Update' : 'Create'}</Button>
            </DialogActions>
          </form>
        </Dialog>
        {/* Delete Confirmation Dialog */}
        <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
          <DialogTitle>Delete Task?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button color="error" onClick={() => handleDelete(deleteId)}>Delete</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
} 