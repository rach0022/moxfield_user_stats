import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import searchReducer from './reducers/searchReducer';
import scryfallReducer from './slicers/scryfallSlice.js';

// Combine reducers
const rootReducer = combineReducers({
    search: searchReducer,
    cards: scryfallReducer
});

// Create the Redux store with thunk middleware
const store = configureStore({
    reducer: rootReducer,
});

export default store;
