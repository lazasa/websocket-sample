const http = require("http");
const crypto = require("crypto");

const server = http.createServer();

server.on("upgrade", (req, socket) => {
  // 1. Validate upgrade header
  if (req.headers["upgrade"] !== "websocket") {
    socket.end("HTTP/1.1 400 Bad Request");
    return;
  }

  // 2. Generate accept key for handshake
  const key = req.headers["sec-websocket-key"];
  const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
  const acceptKey = crypto
    .createHash("sha1")
    .update(key + GUID)
    .digest("base64");

  // 3. Send handshake response
  socket.write(
    [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "\r\n",
    ].join("\r\n")
  );

  // --- WebSocket connection is established. ---

  // 4. Handle incoming frames
  socket.on("data", (buffer) => {
    // Very minimal frame parsing (text frame only)
    const opcode = buffer[0] & 0x0f;
    if (opcode === 0x8) {
      socket.end(); // client sent close frame
      return;
    }

    const isMasked = buffer[1] & 0x80;
    if (!isMasked) return; // all client frames must be masked

    const payloadLength = buffer[1] & 0x7f;
    const mask = buffer.slice(2, 6);
    const payload = buffer.slice(6, 6 + payloadLength);

    // Unmask
    const unmasked = Buffer.alloc(payloadLength);
    for (let i = 0; i < payloadLength; i++) {
      unmasked[i] = payload[i] ^ mask[i % 4];
    }

    const message = unmasked.toString();
    console.log("Client says:", message);

    // 5. Send response frame (text)
    const response = Buffer.from(message);
    const header = Buffer.from([0x81, response.length]); // 0x81 = FIN + text opcode

    socket.write(Buffer.concat([header, response]));
  });
});

server.listen(8080, () =>
  console.log("WebSocket server running on ws://localhost:8080")
);
