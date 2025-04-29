import { configureStore } from '@reduxjs/toolkit';

// Sample reducer for demonstration
const initialState = {
  files: {
    recentFiles: [],
  },
  visualizations: {
    savedVisualizations: [],
  },
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

const store = configureStore({
  reducer: rootReducer,
});

export default store;