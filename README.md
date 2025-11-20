# WebSocket Sample

A minimal WebSocket demo showing:
- A **Node.js** server that implements the WebSocket protocol
- A **browser client** that connects, sends a message, and receives live updates
The goal is to illustrate how WebSocket handshakes and frames work without using external libraries.

---

## Features

- Manual WebSocket **handshake** using `Sec-WebSocket-Key` and SHA‑1
- Manual **frame creation/parsing** (text frames, masking, simple broadcast)
- Browser client built with plain **HTML + JavaScript**
- Server pushes the current time to all connected clients every 5 seconds

---

## Project Structure

- [index.html](index.html)  
  Basic page with a button to connect/disconnect and a list of received messages.

- [script.js](script.js)  
  Front‑end WebSocket client:
  - Connects to `ws://localhost:8080`
  - Sends `"Hello from Client!"` once connected
  - Displays every message from the server in a list

- [server.js](server.js)  
  Minimal Node WebSocket server:
  - Handles HTTP `Upgrade: websocket`
  - Computes `Sec-WebSocket-Accept`
  - Parses masked client frames
  - Sends simple unmasked text frames back
  - Broadcasts server time to all clients every 5 seconds

- [.prettierrc](.prettierrc)  
  Formatting rules used for this project.

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v14+ recommended)
- A modern web browser (Chrome, Firefox, Edge, etc.)

---

## Installation

There are no external packages to install; it uses only Node’s built‑in `http` and `crypto` modules.

---

## Running the Server

From the project root:

```bash
node server.js
```

You should see:

```text
WebSocket server running on ws://localhost:8080
```

The server listens on port `8080`.

---

## Using the Client

1. Open [index.html](index.html) in your browser:
   - Either open the file directly (double‑click / drag into browser), or
   - Serve it with a simple static server (for example `npx serve .`).

2. Click **“Connect to WebSocket Server”**:
   - The button text changes to **“Disconnect from server”**.
   - The client sends `"Hello from Client!"` to the server.

3. Watch the **“Received Messages”** list:
   - You’ll see the server’s echo: `Server received: Hello from Client!`
   - Every 5 seconds you’ll see updates like: `Server time: 2025-01-01T12:00:00.000Z`

4. Click the button again to **disconnect**.

---

## How It Works 
Maybe this section would be too long to be here. I invite you to read my blog post about WebSockets where you can find the full explanation of this.

[blog.lazajs.site/en](https://blog.lazajs.site/en)

## Notes & Limitations

- Only supports **small text messages** ($< 126$ bytes).
- Does **not** handle:
  - Fragmented frames
  - Binary frames
  - Pings/pongs
  - Extensions or subprotocols
- Intended purely as an **educational example**, not for production use.

---

## License

Use, modify, and share freely for learning and experimentation.