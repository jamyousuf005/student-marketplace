const { Server } = require('socket.io')
const http = require('http')

const PORT = process.env.SOCKET_PORT || 4000

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end('Socket.IO Server is running\n')
})

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

const activeUsers = new Map() // userId -> socketId

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id)

  socket.on('register_user', (userId) => {
    activeUsers.set(userId, socket.id)
    io.emit('online_users', Array.from(activeUsers.keys()))
  })

  socket.on('send_message', (data) => {
    const { receiverId, senderId, content, taskId, createdAt } = data
    const receiverSocketId = activeUsers.get(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('receive_message', {
        senderId,
        receiverId,
        content,
        taskId,
        createdAt: createdAt || new Date().toISOString(),
      })
    }
  })

  socket.on('typing', ({ senderId, receiverId }) => {
    const receiverSocketId = activeUsers.get(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('user_typing', { senderId })
    }
  })

  socket.on('disconnect', () => {
    for (const [userId, socketId] of activeUsers.entries()) {
      if (socketId === socket.id) {
        activeUsers.delete(userId)
        break
      }
    }
    io.emit('online_users', Array.from(activeUsers.keys()))
    console.log('Client disconnected:', socket.id)
  })
})

server.listen(PORT, () => {
  console.log(`Socket.IO Server running on port ${PORT}`)
})
