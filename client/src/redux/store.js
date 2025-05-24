import { combineReducers, configureStore } from '@reduxjs/toolkit'; 
import userReducer from './user/userSlice';//Importing the reducer for the user slice.
import { persistReducer, persistStore } from 'redux-persist';//functions for state persistence
import storage from 'redux-persist/lib/storage'; // storage method for state persistence

/*Combine reducers from different slices into a single root reducer. If we had several, we would list them with the user one. eg. ({user: userReducer, listings: listingReducer})*/
const rootReducer = combineReducers({ user: userReducer });

// Configuration for Redux Persist
const persistConfig = {
  key: 'root', // Key for the persisted state in storage
  storage, // Storage method for persisted state
  version: 1, // Version number for state migrations
};

// Create a persisted reducer by wrapping the root reducer with persist configuration
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure the Redux store with the persisted reducer
export const store = configureStore({
  reducer: persistedReducer, //Set persisted reducer as the root reducer for the store
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({  
    serializableCheck: false,
  }),
});

// Create a persistor to manage state persistence
export const persistor = persistStore(store);
