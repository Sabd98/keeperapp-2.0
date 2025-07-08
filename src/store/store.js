import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./features/authSlice";
import checklistReducer from "./features/checklistSlice";
import checklistItemReducer from "./features/checklistItemSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    checklists: checklistReducer,
    checklistItems:checklistItemReducer
  },
});
