import {
    CALL_INITIAL,
    CALL_LOADING,
    CALL_SUCCESS,
    CALL_FAILED,
} from './actionTypes';

const initialState = {
    status: 'initial',
    data: null,
    error: null,
};

const callReducer = (state = initialState, action) => {
    switch (action.type) {
        case CALL_INITIAL:
            return {
                ...state,
                status: 'initial',
                data: null,
                error: null,
            };
        case CALL_LOADING:
            return {
                ...state,
                status: 'loading',
                data: null,
                error: null,
            };
        case CALL_SUCCESS:
            return {
                ...state,
                status: 'success',
                data: action.payload,
                error: null,
            };
        case CALL_FAILED:
            return {
                ...state,
                status: 'failed',
                data: null,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default callReducer;
