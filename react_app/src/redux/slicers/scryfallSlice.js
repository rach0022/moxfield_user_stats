import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchCardScryfallInfo = createAsyncThunk(
    'cards/fetchCardScryfallInfo',
    async ({ cardsToFindArray, CSRFToken }, { rejectWithValue }) => {
        try {
            const response = await axios.post('/get_card_scryfall_info/', {
                cards_to_find: cardsToFindArray
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CSRFToken
                }
            });
            return response.data;
        } catch (err) {
            return rejectWithValue(err.response.data);
        }
    }
);

const scryfallSlice = createSlice({
    name: 'cards',
    initialState: {
        top10CardsInPotentialCombos: [],
        topTenCardsForPotentialCombosList: [],
        status: 'idle',
        error: null
    },
    reducers: {
        setTop10CardsInPotentialCombos(state, action) {
            state.top10CardsInPotentialCombos = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCardScryfallInfo.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCardScryfallInfo.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.topTenCardsForPotentialCombosList = action.payload['found_cards'];
            })
            .addCase(fetchCardScryfallInfo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    }
});

export const { setTop10CardsInPotentialCombos } = scryfallSlice.actions;

export default scryfallSlice.reducer;
