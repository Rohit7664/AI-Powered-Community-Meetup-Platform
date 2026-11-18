import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchMyGroups = createAsyncThunk('groups/fetchMyGroups', async (_, thunkAPI) => {
  try {
    const res = await api.get('/groups/my');
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const fetchRecommendedGroups = createAsyncThunk(
  'groups/fetchRecommended',
  async (_, thunkAPI) => {
    try {
      const res = await api.get('/groups/recommended');
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const fetchInvitations = createAsyncThunk('groups/fetchInvitations', async (_, thunkAPI) => {
  try {
    const res = await api.get('/invitations');
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

export const acceptInvitationAction = createAsyncThunk(
  'groups/acceptInvitation',
  async (invitationId, thunkAPI) => {
    try {
      const res = await api.post(`/invitations/${invitationId}/accept`);
      thunkAPI.dispatch(fetchInvitations());
      thunkAPI.dispatch(fetchMyGroups());
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

export const rejectInvitationAction = createAsyncThunk(
  'groups/rejectInvitation',
  async (invitationId, thunkAPI) => {
    try {
      const res = await api.post(`/invitations/${invitationId}/reject`);
      thunkAPI.dispatch(fetchInvitations());
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const groupSlice = createSlice({
  name: 'groups',
  initialState: {
    myGroups: [],
    recommendedGroups: [],
    invitations: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // My groups
      .addCase(fetchMyGroups.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.myGroups = action.payload;
      })
      .addCase(fetchMyGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Recommended groups
      .addCase(fetchRecommendedGroups.fulfilled, (state, action) => {
        state.recommendedGroups = action.payload;
      })
      // Invitations
      .addCase(fetchInvitations.fulfilled, (state, action) => {
        state.invitations = action.payload;
      });
  },
});

export default groupSlice.reducer;
