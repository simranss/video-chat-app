import {
    CALL_INITIAL,
    CALL_LOADING,
    CALL_SUCCESS,
    CALL_FAILED,
} from './actionTypes';

export const callInitial = () => ({
    type: CALL_INITIAL,
});

export const callLoading = () => ({
    type: CALL_LOADING,
});

export const callSuccess = (data) => ({
    type: CALL_SUCCESS,
    payload: data,
});

export const callFailed = (error) => ({
    type: CALL_FAILED,
    payload: error,
});