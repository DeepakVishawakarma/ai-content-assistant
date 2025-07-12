import { createSlice } from "@reduxjs/toolkit";

const contentSlice = createSlice({
  name: "content",
  initialState: { items: [], current: "" },
  reducers: {
    setContent: (state, action) => {
      state.current = action.payload;
    },
    addContent: (state, action) => {
      state.items.push(action.payload);
    },
  },
});

export const { setContent, addContent } = contentSlice.actions;
export default contentSlice.reducer;
