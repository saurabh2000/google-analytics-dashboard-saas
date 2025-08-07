// import { NextRequest } from 'next/server' // TODO: Use NextRequest for socket API
import { Server } from 'socket.io'

// Store active dashboard rooms and users
interface DashboardRoom {
  id: string
  users: Map<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  state: any // eslint-disable-line @typescript-eslint/no-explicit-any
  lastActivity: Date
}

const dashboardRooms = new Map<string, DashboardRoom>()

// Initialize Socket.IO server
let io: Server | null = null

function initializeSocket() {
  if (io) return io

  // Don't initialize during build time
  if (!process.env.WS_PORT && process.env.NODE_ENV === 'production') {
    return null
  }

  // Create HTTP server for Socket.IO
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createServer } = require('http')
  const server = createServer()

  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id)

    // Join dashboard room
    socket.on('join_dashboard', ({ user, dashboardId }) => {
      console.log(`User ${user.name} joining dashboard ${dashboardId}`)
      
      // Leave any previous rooms
      Array.from(socket.rooms).forEach(room => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })

      // Join new room
      socket.join(dashboardId)
      
      // Get or create room
      if (!dashboardRooms.has(dashboardId)) {
        dashboardRooms.set(dashboardId, {
          id: dashboardId,
          users: new Map(),
          state: {
            selectedDateRange: '30d',
            enabledKpiCards: ['total-users', 'sessions', 'page-views', 'avg-session'],
            selectedJourneySource: 'reddit-ads',
            connectedProperty: null,
            drillDownPath: []
          },
          lastActivity: new Date()
        })
      }

      const room = dashboardRooms.get(dashboardId)!
      
      // Add user to room
      room.users.set(socket.id, { 
        ...user, 
        socketId: socket.id,
        joinedAt: new Date()
      })

      // Update room activity
      room.lastActivity = new Date()

      // Send current state to new user
      socket.emit('state_updated', room.state)

      // Notify all users in room about updated user list
      const activeUsers = Array.from(room.users.values())
      io?.to(dashboardId).emit('users_updated', activeUsers)

      // Broadcast join event
      socket.broadcast.to(dashboardId).emit('collaboration_event', {
        type: 'user_join',
        data: { user },
        user,
        timestamp: new Date()
      })
    })

    // Handle dashboard state changes
    socket.on('dashboard_state_change', ({ state, event }) => {
      const rooms = Array.from(socket.rooms)
      const dashboardId = rooms.find(room => room !== socket.id)

      if (dashboardId && dashboardRooms.has(dashboardId)) {
        const room = dashboardRooms.get(dashboardId)!
        
        // Update room state
        room.state = { ...room.state, ...state }
        room.lastActivity = new Date()

        // Broadcast state change to all users except sender
        socket.broadcast.to(dashboardId).emit('state_updated', room.state)
        socket.broadcast.to(dashboardId).emit('collaboration_event', event)
      }
    })

    // Handle collaboration events
    socket.on('collaboration_event', (event) => {
      const rooms = Array.from(socket.rooms)
      const dashboardId = rooms.find(room => room !== socket.id)

      if (dashboardId) {
        socket.broadcast.to(dashboardId).emit('collaboration_event', event)
        
        // Update room activity
        if (dashboardRooms.has(dashboardId)) {
          dashboardRooms.get(dashboardId)!.lastActivity = new Date()
        }
      }
    })

    // Handle cursor movement
    socket.on('cursor_move', ({ x, y }) => {
      const rooms = Array.from(socket.rooms)
      const dashboardId = rooms.find(room => room !== socket.id)

      if (dashboardId && dashboardRooms.has(dashboardId)) {
        const room = dashboardRooms.get(dashboardId)!
        const user = room.users.get(socket.id)

        if (user) {
          user.cursor = { x, y }
          room.users.set(socket.id, user)

          // Broadcast cursor position to other users
          socket.broadcast.to(dashboardId).emit('cursor_moved', {
            userId: user.id,
            cursor: { x, y }
          })
        }
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id)

      // Find which dashboard this user was in
      for (const [dashboardId, room] of dashboardRooms.entries()) {
        if (room.users.has(socket.id)) {
          const user = room.users.get(socket.id)
          room.users.delete(socket.id)

          // Update room activity
          room.lastActivity = new Date()

          // Notify remaining users
          const activeUsers = Array.from(room.users.values())
          socket.broadcast.to(dashboardId).emit('users_updated', activeUsers)

          // Broadcast leave event
          socket.broadcast.to(dashboardId).emit('collaboration_event', {
            type: 'user_leave',
            data: { user },
            user,
            timestamp: new Date()
          })

          // Clean up empty rooms
          if (room.users.size === 0) {
            dashboardRooms.delete(dashboardId)
          }

          break
        }
      }
    })
  })

  // Clean up inactive rooms every 5 minutes
  setInterval(() => {
    const now = new Date()
    const maxInactivity = 5 * 60 * 1000 // 5 minutes

    for (const [dashboardId, room] of dashboardRooms.entries()) {
      if (now.getTime() - room.lastActivity.getTime() > maxInactivity && room.users.size === 0) {
        console.log(`Cleaning up inactive room: ${dashboardId}`)
        dashboardRooms.delete(dashboardId)
      }
    }
  }, 5 * 60 * 1000)

  // Start server on port 3001
  const port = process.env.WS_PORT || 3001
  server.listen(port, () => {
    console.log(`Socket.IO server running on port ${port}`)
  })

  return io
}

export async function GET() {
  // Don't start socket server during build/static generation
  if (process.env.VERCEL_ENV === 'preview' || process.env.VERCEL_ENV === 'production') {
    return Response.json({ message: 'Socket.IO disabled in production build', status: 'disabled' })
  }

  // Initialize Socket.IO server if not already done
  if (!io) {
    initializeSocket()
  }

  // Return status
  return Response.json({ 
    status: 'WebSocket server initialized',
    rooms: dashboardRooms.size,
    port: process.env.WS_PORT || 3001
  })
}

// Start WebSocket server when this module is imported
if (process.env.NODE_ENV !== 'development') {
  initializeSocket()
}