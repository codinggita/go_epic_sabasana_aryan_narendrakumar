import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';

export const CardSkeleton = () => {
  return (
    <Box sx={{ padding: '24px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '12px', minHeight: '140px' }}>
      <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
      <Skeleton variant="text" width="60%" height={32} sx={{ marginTop: '16px', bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
      <Skeleton variant="text" width="40%" height={20} sx={{ marginTop: '8px', bgcolor: 'rgba(255, 255, 255, 0.08)' }} />
    </Box>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Skeleton variant="rectangular" width="100%" height={48} sx={{ bgcolor: 'rgba(255, 255, 255, 0.08)', marginBottom: '12px', borderRadius: '4px' }} />
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} variant="rectangular" width="100%" height={40} sx={{ bgcolor: 'rgba(255, 255, 255, 0.04)', marginBottom: '8px', borderRadius: '4px' }} />
      ))}
    </Box>
  );
};

export const GridSkeleton = ({ count = 4 }) => {
  return (
    <Grid container spacing={3}>
      {[...Array(count)].map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <CardSkeleton />
        </Grid>
      ))}
    </Grid>
  );
};

export default {
  Card: CardSkeleton,
  Table: TableSkeleton,
  Grid: GridSkeleton
};
