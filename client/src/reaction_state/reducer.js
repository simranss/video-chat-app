import {
    REACTION_INITIAL,
    REACTION_SUCCESS,
} from './actionTypes';

const initialState = {
    status: 'initial',
    data: null,
    error: null,
};

const reactionReducer = (state = initialState, action) => {
    switch (action.type) {
        case REACTION_INITIAL:
            return {
                ...state,
                status: 'initial',
                data: null,
                error: null,
            };
        case REACTION_SUCCESS:
            return {
                ...state,
                status: 'success',
                data: action.payload,
                error: null,
            };
        default:
            return state;
    }
};

export default reactionReducer;
