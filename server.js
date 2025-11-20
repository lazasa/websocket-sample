const http = require('http')
const crypto = require('crypto')

const server = http.createServer()

// connected clients
const clients = new Set()

// build a simple text frame (length < 126)
function createTextFrame(message) {
  const payload = Buffer.from(message)
  const length = payload.length

  if (length > 125) {
    throw new Error('Payload too large')
  }

  const header = Buffer.from([0x81, length]) // FIN + text, unmasked
  return Buffer.concat([header, payload])
}

// send to one client
function sendToClient(socket, message) {
  const frame = createTextFrame(message)
  socket.write(frame)
}

// broadcast to all clients
function broadcast(message) {
  const frame = createTextFrame(message)
  for (const socket of clients) {
    socket.write(frame)
  }
}

server.on('upgrade', (req, socket) => {
  // 1. Validate upgrade header
  if (req.headers['upgrade'] !== 'websocket') {
    socket.end('HTTP/1.1 400 Bad Request')
    return
  }

  // 2. Generate accept key for handshake
  const key = req.headers['sec-websocket-key']
  const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
  const acceptKey = crypto
    .createHash('sha1')
    .update(key + GUID)
    .digest('base64')

  // 3. Send handshake response
  socket.write(
    [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${acceptKey}`,
      '\r\n'
    ].join('\r\n')
  )

  // Track this client
  clients.add(socket)
  socket.on('close', () => clients.delete(socket))
  socket.on('end', () => clients.delete(socket))
  socket.on('error', () => clients.delete(socket))

  // 4. Handle incoming frames
  socket.on('data', buffer => {
    const opcode = buffer[0] & 0b00001111
    if (opcode === 0x8) {
      // close frame
      socket.end()
      clients.delete(socket)
      return
    }

    const isMasked = buffer[1] & 0b10000000
    if (!isMasked) return // all client frames must be masked

    const payloadLength = buffer[1] & 0b01111111
    const mask = buffer.slice(2, 6)
    const payload = buffer.slice(6, 6 + payloadLength)

    // Unmask
    const unmasked = Buffer.alloc(payloadLength)
    for (let i = 0; i < payloadLength; i++) {
      unmasked[i] = payload[i] ^ mask[i % 4]
    }

    const message = unmasked.toString()
    console.log('Client says:', message)

    sendToClient(socket, `Server received: ${message}`)
  })
})

server.listen(8080, () =>
  console.log('WebSocket server running on ws://localhost:8080')
)

// Push data to all clients every 5 seconds
setInterval(() => {
  const time = new Date().toISOString()
  broadcast(`Server time: ${time}`)
}, 5000)
