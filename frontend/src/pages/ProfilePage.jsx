import { useState, useRef } from 'react';
import { Box, Typography, Avatar, Button, Paper, CircularProgress } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api';

export default function ProfilePage() {
  const { user, notify } = useAuth();
  const [image, setImage] = useState(user?.profileImage || '');
  const [loading, setLoading] = useState(false);
  const fileInput = useRef();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('profileImage', file);
    try {
      const res = await axios.post('/api/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setImage(res.data.imageUrl);
      notify('Profile image updated', 'success');
    } catch (err) {
      notify('Upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper sx={{ p: 4, width: 350, textAlign: 'center' }}>
        <Typography variant="h5" mb={2}>Profile</Typography>
        <Avatar src={image} sx={{ width: 100, height: 100, margin: '0 auto' }} />
        <Typography variant="body1" mt={2}>{user?.name}</Typography>
        <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
        <Button
          variant="contained"
          component="label"
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Image'}
          <input type="file" hidden accept="image/*" ref={fileInput} onChange={handleFileChange} />
        </Button>
      </Paper>
    </Box>
  );
} 