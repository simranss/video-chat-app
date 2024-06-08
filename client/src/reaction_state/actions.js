import {
    REACTION_INITIAL,
    REACTION_SUCCESS,
} from './actionTypes';

export const reactionInitial = () => ({
    type: REACTION_INITIAL,
});

export const reactionSuccess = (data) => ({
    type: REACTION_SUCCESS,
    payload: data,
});