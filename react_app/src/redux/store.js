import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk';
import searchReducer from './reducers/searchReducer';

// Combine reducers
const rootReducer = combineReducers({
    search: searchReducer,
});

// Create the Redux store with thunk middleware
const store = configureStore({
    reducer: rootReducer,
    middleware: [thunk],
});

export default store;
