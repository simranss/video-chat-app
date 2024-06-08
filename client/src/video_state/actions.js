import {
    VIDEO_INITIAL,
    VIDEO_LOADING,
    VIDEO_SUCCESS,
    VIDEO_PLAY, VIDEO_PAUSE,
    VIDEO_FAILED,
} from './actionTypes';

export const videoInitial = () => ({
    type: VIDEO_INITIAL,
});

export const videoLoading = () => ({
    type: VIDEO_LOADING,
});

export const videoSuccess = (data) => ({
    type: VIDEO_SUCCESS,
    payload: data,
});

export const videoPlay = () => ({
    type: VIDEO_PLAY,
});

export const videoPause = () => ({
    type: VIDEO_PAUSE,
});

export const videoFailed = (error) => ({
    type: VIDEO_FAILED,
    payload: error,
});