let disconnect
let connected = false
const connectBtn = document.getElementById('connectBtn')

connectBtn.addEventListener('click', e => {
  if (!connected) {
    e.target.innerText = 'Connecting...'
    connectWebSocket()
  } else {
    disconnect()
  }
})

function connectWebSocket() {
  const socket = new WebSocket('ws://localhost:8080')

  socket.addEventListener('close', event => {
    console.log('WebSocket is closed now.')
    connected = false
    connectBtn.innerText = 'Connect to WebSocket Server'
  })

  socket.addEventListener('open', event => {
    console.log('WebSocket is open now.')
    connectBtn.innerText = 'Disconnect from server'
    socket.send('Hello from Client!')
    connected = true
  })

  socket.addEventListener('message', event => {
    console.log('Message from server ', event.data)
    const messagesList = document.getElementById('messagesList')
    const newMessageItem = document.createElement('li')
    newMessageItem.innerText = event.data
    messagesList.appendChild(newMessageItem)
  })

  disconnect = () => {
    socket.close()
  }
}
