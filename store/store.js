import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "@/lib/reduxStorage"; // Custom storage implementation for Next.js SSR
import authReducer from "./reducer/authReducer";

// Root reducer
const rootReducer = combineReducers({
  authStore: authReducer,
});

// Persist config
const persistConfig = {
  key: "root",
  storage, 
};

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // ✅ allow non-serializable values
    }),
});

// Persistor
export const persistor = persistStore(store);
