import React, { useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import io from "socket.io-client";
import { callInitial, callLoading, callSuccess, callFailed } from "./call_state/actions";
import { videoInitial, videoLoading, videoSuccess, videoPlay, videoPause, videoFailed } from "./video_state/actions";
import { reactionInitial, reactionSuccess } from "./reaction_state/actions";

function App() {
  const callState = useSelector((state) => state.call);
  const reactionState = useSelector((state) => state.reaction);
  const videoState = useSelector((state) => state.video);
  const dispatch = useDispatch();

  // ICE servers
  const servers = {
    iceServers: [
      {
        urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  // Global State
  const pc = new RTCPeerConnection(servers);
  const socket = io("http://localhost:3301");
  let localStream = null;
  let remoteStream = null;

  // HTML elements
  const roomIdInput = useRef(null);
  const usernameInput = useRef(null);
  const videoUrlInput = useRef(null);
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const handleVideoStreams = async () => {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    remoteStream = new MediaStream();

    // Pull tracks from remote stream, add to video stream
    pc.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    localVideo.current.srcObject = localStream;
    remoteVideo.current.srcObject = remoteStream;
  };

  // joining a room with the roomId
  const handleJoinRoom = async () => {
    // get username and roomId
    const roomId = roomIdInput.current.value;
    const username = usernameInput.current.value;
    if (username && roomId) {
      // call connecting
      dispatch(callLoading());

      socket.emit("join-room", username, roomId, async (response) => {
        const valid = response.valid;

        if (valid) {
          // get the streams
          await handleVideoStreams();

          // answer candidates
          pc.onicecandidate = (event) => {
            event.candidate && socket.emit("answer-candidates", roomId, event.candidate.toJSON());
          };

          // get the offer
          const offer = response.offer;
          if (!pc.currentRemoteDescription && offer) {
            const offerDescription = new RTCSessionDescription(offer);
            pc.setRemoteDescription(offerDescription);
          }

          // listen for more offers
          socket.on(`${roomId}-offer`, (offer) => {
            if (!pc.currentRemoteDescription && offer) {
              const offerDescription = new RTCSessionDescription(offer);
              pc.setRemoteDescription(offerDescription);
            }
          });

          // Create answer
          const answerDescription = await pc.createAnswer();
          await pc.setLocalDescription(answerDescription);

          const answer = {
            sdp: answerDescription.sdp,
            type: answerDescription.type,
          };

          socket.emit("answer", roomId, answer);

          // get the existing offerCandidates
          const existingOfferCandidates = response.offerCandidates;
          if (existingOfferCandidates && existingOfferCandidates.length > 0) {
            for (let existingCandidate of existingOfferCandidates) {
              if (existingCandidate) {
                const candidate = new RTCIceCandidate(existingCandidate);
                pc.addIceCandidate(candidate);
              }
            }
          }

          // listen for more offerCandidates
          socket.on(`${roomId}-offer-candidates`, (offerCandidate) => {
            if (offerCandidate) {
              const candidate = new RTCIceCandidate(offerCandidate);
              pc.addIceCandidate(candidate);
            }
          });

          // listen for alerts
          socket.on(`${roomId}-alerts`, (alert) => {
            console.log("alert", alert);
          });

          // disconnected
          socket.on("disconnect", (reason, details) => {
            console.log("you got disconnected for this reason", reason);
            socket.off();
          });

          socket.on(`${roomId}-user-left`, (socketId) => {
            if (socketId && socketId !== socket.id) {
              remoteVideo.current.srcObject = MediaStream();
            }
          });

          // call success
          dispatch(callSuccess("Call Success"));
        } else {
          dispatch(callFailed("room does not exist or 2 people already have a connection"));
          console.log("room does not exist or 2 people already have a connection");
          alert(response.message);
        }
      });
    } else {
      dispatch(callInitial());
      alert("Enter a Username and Room ID");
    }
  };

  // create a room
  const handleCreateRoom = () => {
    // get username
    const username = usernameInput.current.value;
    if (username) {

      // call connecting
      dispatch(callLoading());

      socket.emit("create-room", username, async (response) => {
        const roomId = response.roomId;
        console.log("roomId", roomId);

        if (roomId) {
          // get the streams
          await handleVideoStreams();

          // offer candidates
          pc.onicecandidate = (event) => {
            event.candidate && socket.emit("offer-candidates", roomId, event.candidate.toJSON());
          };

          // Create offer
          const offerDescription = await pc.createOffer();
          await pc.setLocalDescription(offerDescription);

          const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
          };

          socket.emit("offer", roomId, offer);

          // listen for answer
          socket.on(`${roomId}-answer`, (answer) => {
            if (!pc.currentRemoteDescription && answer) {
              const answerDescription = new RTCSessionDescription(answer);
              pc.setRemoteDescription(answerDescription);
            }
          });

          // listen for answerCandidates
          socket.on(`${roomId}-answer-candidates`, (answerCandidate) => {
            if (answerCandidate) {
              const candidate = new RTCIceCandidate(answerCandidate);
              pc.addIceCandidate(candidate);
            }
          });

          // listen for alerts
          socket.on(`${roomId}-alerts`, (alert) => {
            console.log("alert", alert);
          });

          // disconnected
          socket.on("disconnect", (reason, details) => {
            console.log("you got disconnected for this reason", reason);
            socket.off();
          });

          socket.on(`${roomId}-user-left`, (socketId) => {
            if (socketId && socketId !== socket.id) {
              remoteVideo.current.srcObject = null;
            }
          });

          // call success
          dispatch(callSuccess("Call Success"));
        } else {
          dispatch(callFailed("room id invalid"));
          console.log("error creating a room");
          alert("Error creating a room");
        }
      });
    } else {
      dispatch(callInitial());
      alert("Enter a Username");
    }
  };

  // for loading a video on both sides
  const handleLoadVideo = () => { };

  // play the video
  const handlePlay = () => { };

  // pause the video
  const handlePause = () => { };

  // screen share
  const handleScreenShare = () => { };

  // reactions
  const handleReaction = () => { };

  // end the call
  const handleEndCall = () => { };

  return (
    <div className="App">
      {(callState.status === 'initial' || callState.status === 'failed') &&
        <div>
          <input ref={usernameInput} type="text" placeholder="Username" required /> <br />
          <input ref={roomIdInput} type="text" placeholder="Room ID" />
          <button onClick={handleJoinRoom}>Join Room</button><br />

          <button onClick={handleCreateRoom}>Create a room instead</button>
        </div>}

      {callState.status === "loading" && <p>Connecting...</p>}

      {(callState.status === 'success') &&
        <div>
          <input ref={videoUrlInput} type="text" />
          <button onClick={handleLoadVideo}>Load Video</button>

          {(videoState.status === 'success' || videoState.status === 'playing' || videoState.status === 'paused') &&
            <div>
              <button onClick={handlePlay}>Play</button>
              <button onClick={handlePause}>Pause</button>
              {videoState.status === 'playing' && <p>isPlaying: Playing</p>}
              {videoState.status === 'paused' && <p>isPlaying: Paused</p>}
              {videoState.status === 'success' && <p>isPlaying: None</p>}
            </div>}

          <button onClick={handleScreenShare}>Start Screen Share</button>
          <button onClick={handleReaction}>😍</button>
        </div>}
      {!(callState.status === 'initial' || callState.status === 'failed') &&
        <div>
          <video
            ref={localVideo}
            autoPlay
            muted
            style={{ width: "300px", height: "200px" }}
          />
          <video
            ref={remoteVideo}
            autoPlay
            style={{ width: "300px", height: "200px" }}
          />
        </div>}

      {(callState.status === 'success') && <button onClick={handleEndCall}>End Call</button>}
    </div>
  );
}

export default App;
