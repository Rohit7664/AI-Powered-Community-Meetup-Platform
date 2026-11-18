import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const savedToken = localStorage.getItem('interesthub_token');
const savedUser = localStorage.getItem('interesthub_user')
  ? JSON.parse(localStorage.getItem('interesthub_user'))
  : null;

export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    const res = await api.post('/auth/login', credentials);
    const { token, user } = res.data;
    localStorage.setItem('interesthub_token', token);
    localStorage.setItem('interesthub_user', JSON.stringify(user));
    initSocket(token);
    return { token, user };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const res = await api.post('/auth/register', userData);
    const { token, user } = res.data;
    localStorage.setItem('interesthub_token', token);
    localStorage.setItem('interesthub_user', JSON.stringify(user));
    initSocket(token);
    return { token, user };
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchCurrentUser = createAsyncThunk('auth/fetchMe', async (_, thunkAPI) => {
  try {
    const res = await api.get('/auth/me');
    const user = res.data.user;
    localStorage.setItem('interesthub_user', JSON.stringify(user));
    return user;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: savedToken,
    user: savedUser,
    isAuthenticated: !!savedToken,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('interesthub_token');
      localStorage.removeItem('interesthub_user');
      disconnectSocket();
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('interesthub_user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch me
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout, updateUser, clearError } = authSlice.actions;
export default authSlice.reducer;
