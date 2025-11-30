import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "@/lib/reduxStorage"; 
import authReducer from "./reducer/authReducer";

const rootReducer = combineReducers({
  authStore: authReducer,
});

const persistConfig = {
  key: "root",
  storage, 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, 
    }),
});

export const persistor = persistStore(store);
