import { configureStore } from "@reduxjs/toolkit";
import notesReducer from "./notesSlice";
import editorReducer from "./editorSlice";

export const store = configureStore({
  reducer: {
    notes: notesReducer,
    editor: editorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
