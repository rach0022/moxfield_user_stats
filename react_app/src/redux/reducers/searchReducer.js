import {
    SEARCH_REQUEST,
    SEARCH_SUCCESS,
    SEARCH_FAILURE,
} from '../actions/searchActions';

// Initial state for the search reducer
const initialState = {
    loading: false,
    data: null,
    error: null,
};

// Reducer function for handling search actions
const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };
        case SEARCH_SUCCESS:
            return {
                ...state,
                loading: false,
                data: action.payload,
            };
        case SEARCH_FAILURE:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default searchReducer;
