import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    users: userReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // turn off to allow flexible payload objects
    }),
});
export default store;
