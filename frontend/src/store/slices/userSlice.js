import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchUsers = createAsyncThunk(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/admin/users');
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/create',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post('/admin/users', userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create user');
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/update',
  async ({ userId, userData }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/admin/users/${userId}`, userData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/delete',
  async (userId, { rejectWithValue }) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      return userId;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(u => u._id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
