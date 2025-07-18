import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/api";

export const fetchChecklists = createAsyncThunk(
  "checklists/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/checklist");
      console.log("Fetch checklists response:", response.data);

      // Fokus pada properti 'data' jika ada
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createChecklist = createAsyncThunk(
  "checklists/create",
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/checklist", data);

      // Pastikan struktur response konsisten
      return {
        id: response.data.id || response.data.data?.id,
        name: data.name,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteChecklist = createAsyncThunk(
  "checklists/delete",
  async (id) => {
    await axiosInstance.delete(`/checklist/${id}`);
    return id;
  }
);

const checklistSlice = createSlice({
  name: "checklists",
  initialState: {
    items: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchChecklists.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchChecklists.fulfilled, (state, action) => {
        state.status = "succeeded";

        // Pastikan kita selalu menyimpan array
        if (Array.isArray(action.payload)) {
          state.items = action.payload;
        } else {
          // Jika bukan array, simpan array kosong dan log error
          console.error("Expected array but got:", action.payload);
          state.items = [];
        }
      })
      .addCase(fetchChecklists.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(createChecklist.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(deleteChecklist.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export default checklistSlice.reducer;
