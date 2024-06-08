const express = require("express");
const http = require("http");
const app = express();

const server = http.createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT",]
  }
});
const { v4: uuidV4 } = require('uuid');

const rooms = {};

io.on("connection", (socket) => {

  // create room
  socket.on("create-room", (username, callback) => {
    const roomId = uuidV4();
    socket.data.username = username;
    socket.data.roomId = roomId;
    rooms[roomId] = {
      creator: {
        username: username,
        id: socket.id,
      },
      offerCandidates: [],
      answerCandidates: [],
    };
    callback({ roomId: roomId });
  });

  // join room
  socket.on("join-room", (username, roomId, callback) => {
    socket.data.username = username;
    if (roomId && username && roomId in rooms) {
      if ("answer" in rooms[roomId]) {
        console.log("two people are already there");
        callback({ valid: false, message: "The room is full" });
      } else {
        socket.data.roomId = roomId;
        rooms[roomId].joiner = {
          username: username,
          id: socket.id,
        }
        socket.broadcast.emit(`${roomId}-alerts`, `${username} is joining the room`);
        callback({ valid: true, offer: rooms[roomId].offer, offerCandidates: rooms[roomId].offerCandidates });
      }
    } else {
      console.log("either the values are null or roomId does not exist");
      callback({ valid: false, message: "Room ID does not exist" });
    }
  });

  // receive offer candidate
  socket.on("offer-candidates", (roomId, candidate) => {
    if (roomId && candidate && roomId in rooms) {
      rooms[roomId].offerCandidates.push(candidate);
      socket.broadcast.emit(`${roomId}-offer-candidates`, candidate);
    }
  });

  // receive answer candidate
  socket.on("answer-candidates", (roomId, candidate) => {
    if (roomId && candidate && roomId in rooms) {
      rooms[roomId].answerCandidates.push(candidate);
      socket.broadcast.emit(`${roomId}-answer-candidates`, candidate);
    }
  });

  // receive offer
  socket.on("offer", (roomId, offer) => {
    if (roomId && offer && roomId in rooms) {
      rooms[roomId].offer = offer;
      socket.broadcast.emit(`${roomId}-offer`, offer);
    }
  });

  // receive answer
  socket.on("answer", (roomId, answer) => {
    if (roomId && answer && roomId in rooms) {
      rooms[roomId].answer = answer;
      socket.broadcast.emit(`${roomId}-answer`, answer);
    }
  });

  // disconnected or lost connection
  socket.on("disconnect", () => {
    console.log(`${socket.data.username} disconnected`);
    io.emit(`${socket.data.roomId}-user-left`, socket.id);
  });
});

const PORT = process.env.PORT || 3301;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
