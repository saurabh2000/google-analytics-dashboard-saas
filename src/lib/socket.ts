// WebSocket client connection for real-time collaboration
import { io, Socket } from 'socket.io-client'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  color: string
  cursor?: { x: number; y: number }
  lastSeen: Date
}

export interface CollaborationEvent {
  type: 'filter_change' | 'card_add' | 'card_remove' | 'chart_drill' | 'cursor_move' | 'user_join' | 'user_leave'
  data: any // eslint-disable-line @typescript-eslint/no-explicit-any
  user: User
  timestamp: Date
}

export interface DashboardState {
  selectedDateRange: string
  enabledKpiCards: string[]
  selectedJourneySource: string
  connectedProperty: string | null
  drillDownPath: string[]
}

class CollaborationManager {
  private socket: Socket | null = null
  private currentUser: User | null = null
  private activeUsers: Map<string, User> = new Map()
  private dashboardState: DashboardState | null = null
  
  // Event listeners
  private onUsersUpdatedListeners: ((users: User[]) => void)[] = []
  private onStateUpdatedListeners: ((state: DashboardState) => void)[] = []
  private onEventListeners: ((event: CollaborationEvent) => void)[] = []

  connect(user: Omit<User, 'color' | 'lastSeen'>, dashboardId: string) {
    if (this.socket?.connected) {
      this.disconnect()
    }

    // Temporarily disable WebSocket connection - no server running
    // this.socket = io(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001', {
    //   query: { dashboardId }
    // })
    console.log('WebSocket disabled - no server running on port 3001')

    // Generate a color for this user
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'
    ]
    const userColor = colors[Math.floor(Math.random() * colors.length)]

    this.currentUser = {
      ...user,
      color: userColor,
      lastSeen: new Date()
    }

    // Join the dashboard room - disabled without server
    // this.socket.emit('join_dashboard', {
    //   user: this.currentUser,
    //   dashboardId
    // })

    // Listen for events - disabled without server
    // this.setupEventListeners()
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
    this.activeUsers.clear()
    this.currentUser = null
    this.dashboardState = null
  }

  private setupEventListeners() {
    if (!this.socket) return

    // Users updated
    this.socket.on('users_updated', (users: User[]) => {
      this.activeUsers.clear()
      users.forEach(user => {
        this.activeUsers.set(user.id, user)
      })
      this.notifyUsersUpdated(users)
    })

    // Dashboard state updated
    this.socket.on('state_updated', (state: DashboardState) => {
      this.dashboardState = state
      this.notifyStateUpdated(state)
    })

    // Collaboration events
    this.socket.on('collaboration_event', (event: CollaborationEvent) => {
      this.notifyEvent(event)
    })

    // User cursor movement
    this.socket.on('cursor_moved', ({ userId, cursor }: { userId: string, cursor: { x: number, y: number } }) => {
      const user = this.activeUsers.get(userId)
      if (user) {
        user.cursor = cursor
        this.activeUsers.set(userId, user)
        this.notifyUsersUpdated(Array.from(this.activeUsers.values()))
      }
    })
  }

  // Emit events
  updateDashboardState(newState: Partial<DashboardState>) {
    if (!this.socket || !this.currentUser) return

    const event: CollaborationEvent = {
      type: 'filter_change',
      data: newState,
      user: this.currentUser,
      timestamp: new Date()
    }

    this.socket.emit('dashboard_state_change', {
      state: newState,
      event
    })
  }

  addKpiCard(cardId: string) {
    if (!this.socket || !this.currentUser) return

    const event: CollaborationEvent = {
      type: 'card_add',
      data: { cardId },
      user: this.currentUser,
      timestamp: new Date()
    }

    this.socket.emit('collaboration_event', event)
  }

  removeKpiCard(cardId: string) {
    if (!this.socket || !this.currentUser) return

    const event: CollaborationEvent = {
      type: 'card_remove',
      data: { cardId },
      user: this.currentUser,
      timestamp: new Date()
    }

    this.socket.emit('collaboration_event', event)
  }

  drillDown(path: string[]) {
    if (!this.socket || !this.currentUser) return

    const event: CollaborationEvent = {
      type: 'chart_drill',
      data: { path },
      user: this.currentUser,
      timestamp: new Date()
    }

    this.socket.emit('collaboration_event', event)
  }

  updateCursor(x: number, y: number) {
    if (!this.socket || !this.currentUser) return

    this.socket.emit('cursor_move', { x, y })
  }

  // Event listeners
  onUsersUpdated(callback: (users: User[]) => void) {
    this.onUsersUpdatedListeners.push(callback)
    return () => {
      const index = this.onUsersUpdatedListeners.indexOf(callback)
      if (index > -1) {
        this.onUsersUpdatedListeners.splice(index, 1)
      }
    }
  }

  onStateUpdated(callback: (state: DashboardState) => void) {
    this.onStateUpdatedListeners.push(callback)
    return () => {
      const index = this.onStateUpdatedListeners.indexOf(callback)
      if (index > -1) {
        this.onStateUpdatedListeners.splice(index, 1)
      }
    }
  }

  onEvent(callback: (event: CollaborationEvent) => void) {
    this.onEventListeners.push(callback)
    return () => {
      const index = this.onEventListeners.indexOf(callback)
      if (index > -1) {
        this.onEventListeners.splice(index, 1)
      }
    }
  }

  private notifyUsersUpdated(users: User[]) {
    this.onUsersUpdatedListeners.forEach(callback => callback(users))
  }

  private notifyStateUpdated(state: DashboardState) {
    this.onStateUpdatedListeners.forEach(callback => callback(state))
  }

  private notifyEvent(event: CollaborationEvent) {
    this.onEventListeners.forEach(callback => callback(event))
  }

  // Getters
  getCurrentUser(): User | null {
    return this.currentUser
  }

  getActiveUsers(): User[] {
    return Array.from(this.activeUsers.values())
  }

  getDashboardState(): DashboardState | null {
    return this.dashboardState
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false
  }
}

// Export singleton instance
export const collaborationManager = new CollaborationManager()
export default collaborationManager