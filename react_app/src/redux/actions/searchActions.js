// Action types for the search
import axios from "axios";

export const SEARCH_REQUEST = 'SEARCH_REQUEST';
export const SEARCH_SUCCESS = 'SEARCH_SUCCESS';
export const SEARCH_FAILURE = 'SEARCH_FAILURE';

// Action creator for initiating a search request
export const searchRequest = () => ({
    type: SEARCH_REQUEST,
});

// Action creator for handling successful search response
export const searchSuccess = (data) => ({
    type: SEARCH_SUCCESS,
    payload: data,
});

// Action creator for handling failed search response
export const searchFailure = (error) => ({
    type: SEARCH_FAILURE,
    payload: error,
});

// Thunk action creator for performing the search request
export const search = (userName, includeLandsValue, CSRFToken) => {
    return async (dispatch) => {
        dispatch(searchRequest()); // Dispatching the request action
        try {
            const response = await axios.post(
                '/search/',
                { user_name: userName, include_lands: includeLandsValue },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': CSRFToken
                    },
                });
            const data = await response['data'];
            if (response.status >= 200 && response.status < 300) {
                dispatch(searchSuccess(data)); // Dispatching the success action
            } else {
                dispatch(searchFailure(data)); // Dispatching the failure action
            }
        } catch (error) {
            dispatch(searchFailure(error.toString())); // Dispatching the failure action in case of an error
        }
    };
};
