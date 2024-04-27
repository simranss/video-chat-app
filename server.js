const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store peer connections
const peerConnections = {};

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle room joining
  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    // Create peer connection if not exists
    if (!peerConnections[roomId]) {
      peerConnections[roomId] = new RTCPeerConnection();
    }

    const peerConnection = peerConnections[roomId];

    // Event handler for sending SDP offer
    peerConnection.onnegotiationneeded = async () => {
      try {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        io.to(roomId).emit("offer", { offer });
      } catch (error) {
        console.error("Error creating or sending offer:", error);
      }
    };

    // Event handler for receiving SDP answer
    socket.on("answer", async (data) => {
      const { answer } = data;
      try {
        await peerConnection.setRemoteDescription(answer);
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    // Event handler for receiving ICE candidates
    socket.on("ice-candidate", async (data) => {
      const { candidate } = data;
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    });

    // Event handler for handling user disconnect
    socket.on("disconnect", () => {
      console.log("A user disconnected");
      if (peerConnections[roomId]) {
        peerConnections[roomId].close();
        delete peerConnections[roomId];
      }
    });
  });

  // Handle play event
  socket.on("play", (roomId) => {
    io.to(roomId).emit("play");
  });

  // Handle pause event
  socket.on("pause", (roomId) => {
    io.to(roomId).emit("pause");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
