import {
    VIDEO_INITIAL,
    VIDEO_LOADING,
    VIDEO_SUCCESS,
    VIDEO_PLAY,
    VIDEO_PAUSE,
    VIDEO_FAILED,
} from './actionTypes';

const initialState = {
    status: 'initial',
    data: null,
    error: null,
};

const videoReducer = (state = initialState, action) => {
    switch (action.type) {
        case VIDEO_INITIAL:
            return {
                ...state,
                status: 'initial',
                data: null,
                error: null,
            };
        case VIDEO_LOADING:
            return {
                ...state,
                status: 'loading',
                data: null,
                error: null,
            };
        case VIDEO_SUCCESS:
            return {
                ...state,
                status: 'success',
                data: action.payload,
                error: null,
            };
        case VIDEO_PLAY:
            return {
                ...state,
                status: 'playing',
                data: null,
                error: null,
            };
        case VIDEO_PAUSE:
            return {
                ...state,
                status: 'paused',
                data: action.payload,
                error: null,
            };
        case VIDEO_FAILED:
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

export default videoReducer;
