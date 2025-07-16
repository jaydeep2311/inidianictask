import { Typography, Box, Button, Stack } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  return (
    <Box textAlign='center' mt={8}>
      <Typography variant='h4' mb={2}>
        Welcome to the Task Manager
      </Typography>
      <Stack direction='row' spacing={2} justifyContent='center' mb={2}>
        <Button variant='contained' onClick={() => navigate('/profile')}>
          Profile
        </Button>
        <Button variant='contained' onClick={() => navigate('/tasks')}>
          Tasks
        </Button>
      </Stack>
      <Button variant='outlined' color='error' onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  )
}
