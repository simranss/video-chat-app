import { configureStore } from '@reduxjs/toolkit';
import callReducer from "./call_state/reducer";
import reactionReducer from "./reaction_state/reducer";
import videoReducer from "./video_state/reducer";

const store = configureStore({
    reducer: {
        call: callReducer, reaction: reactionReducer, video: videoReducer,
    },
});

export default store;