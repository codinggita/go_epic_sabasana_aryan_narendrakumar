import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Snackbar, Alert } from '@mui/material';
import { hideToast } from '../store/slices/uiSlice';

const Toast = () => {
  const dispatch = useDispatch();
  const { open, message, severity } = useSelector((state) => state.ui.toast);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideToast());
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert 
        onClose={handleClose} 
        severity={severity} 
        variant="filled"
        sx={{ width: '100%', fontFamily: 'var(--font-sans)', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;
