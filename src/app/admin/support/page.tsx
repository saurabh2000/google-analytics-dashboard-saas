'use client'

import { useState, useEffect } from 'react'
import { 
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Mail,
  Calendar,
  Tag,
  Search,
  Filter,
  Eye,
  MessageCircle,
  ExternalLink,
  Star,
  ArrowUpDown,
  RefreshCw,
  Download
} from 'lucide-react'

interface SupportTicket {
  id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'technical' | 'billing' | 'feature_request' | 'bug_report' | 'general'
  customerId: string
  customerName: string
  customerEmail: string
  tenantId?: string
  tenantName?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  tags: string[]
  messages: TicketMessage[]
  satisfaction?: number
}

interface TicketMessage {
  id: string
  content: string
  isFromCustomer: boolean
  authorName: string
  authorEmail: string
  createdAt: Date
  attachments?: string[]
}

interface SupportMetrics {
  total: number
  open: number
  inProgress: number
  resolved: number
  avgResponseTime: number
  avgResolutionTime: number
  satisfactionScore: number
  newToday: number
}

// Mock data generators
function generateSupportMetrics(): SupportMetrics {
  return {
    total: 847,
    open: 23,
    inProgress: 15,
    resolved: 809,
    avgResponseTime: 4.2,
    avgResolutionTime: 24.8,
    satisfactionScore: 4.3,
    newToday: 8
  }
}

function generateTicketMessages(): TicketMessage[] {
  return [
    {
      id: 'msg-1',
      content: 'I am unable to access the analytics dashboard. It shows a white screen after logging in.',
      isFromCustomer: true,
      authorName: 'John Smith',
      authorEmail: 'john@acmecorp.com',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 'msg-2',
      content: 'Thank you for contacting support. I can see the issue is related to browser compatibility. Can you please try using Chrome or Firefox?',
      isFromCustomer: false,
      authorName: 'Support Agent',
      authorEmail: 'support@example.com',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000)
    }
  ]
}

function generateSupportTickets(): SupportTicket[] {
  const statuses: SupportTicket['status'][] = ['open', 'in_progress', 'resolved', 'closed']
  const priorities: SupportTicket['priority'][] = ['low', 'medium', 'high', 'critical']
  const categories: SupportTicket['category'][] = ['technical', 'billing', 'feature_request', 'bug_report', 'general']
  const tenants = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Digital Agency']
  const subjects = [
    'Cannot access analytics dashboard',
    'Billing discrepancy in latest invoice',
    'Request for custom reporting feature',
    'Data export functionality not working',
    'User permissions not updating',
    'Performance issues with large datasets',
    'Integration with third-party tools',
    'SSO configuration assistance',
    'API rate limiting questions',
    'Custom domain setup help'
  ]
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `ticket-${String(i + 1).padStart(4, '0')}`,
    subject: subjects[Math.floor(Math.random() * subjects.length)],
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    customerId: `customer-${i + 1}`,
    customerName: `Customer ${i + 1}`,
    customerEmail: `customer${i + 1}@example.com`,
    tenantId: Math.random() > 0.3 ? `tenant-${Math.floor(Math.random() * 5)}` : undefined,
    tenantName: Math.random() > 0.3 ? tenants[Math.floor(Math.random() * tenants.length)] : undefined,
    assignedTo: Math.random() > 0.5 ? 'Support Agent' : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    resolvedAt: Math.random() > 0.6 ? new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000) : undefined,
    tags: Math.random() > 0.5 ? ['urgent', 'escalated'] : ['routine'],
    messages: generateTicketMessages(),
    satisfaction: Math.random() > 0.7 ? Math.floor(Math.random() * 2) + 4 : undefined
  }))
}

function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  format = 'number',
  color = 'blue',
  subtitle
}: {
  title: string
  value: number
  icon: React.ComponentType<{ className?: string }>
  format?: 'number' | 'hours' | 'rating'
  color?: string
  subtitle?: string
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'hours':
        return `${val.toFixed(1)}h`
      case 'rating':
        return `${val.toFixed(1)}/5`
      default:
        return val.toLocaleString()
    }
  }

  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${colorClasses[color]} rounded-md p-3`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="text-lg font-medium text-gray-900">
              {formatValue(value)}
            </dd>
            {subtitle && (
              <dd className="text-sm text-gray-500">{subtitle}</dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}

function TicketRow({ ticket, onAction }: { ticket: SupportTicket; onAction: (action: string, id: string) => void }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="h-4 w-4" />
      case 'in_progress': return <Clock className="h-4 w-4" />
      case 'resolved': return <CheckCircle className="h-4 w-4" />
      case 'closed': return <CheckCircle className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">#{ticket.id}</div>
        <div className="text-sm text-gray-500">{ticket.createdAt.toLocaleDateString()}</div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
          {ticket.subject}
        </div>
        <div className="text-sm text-gray-500 capitalize">{ticket.category.replace('_', ' ')}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{ticket.customerName}</div>
        <div className="text-sm text-gray-500">{ticket.customerEmail}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
          {getStatusIcon(ticket.status)}
          <span className="ml-1">{ticket.status.replace('_', ' ')}</span>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{ticket.assignedTo || 'Unassigned'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {ticket.updatedAt.toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onAction('view', ticket.id)}
          className="text-blue-600 hover:text-blue-900 mr-3"
          title="View ticket"
        >
          <Eye className="h-4 w-4" />
        </button>
        <button
          className="text-gray-400 hover:text-gray-600"
          title="Add comment"
        >
          <MessageCircle className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default function SupportPage() {
  const [metrics, setMetrics] = useState<SupportMetrics | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setMetrics(generateSupportMetrics())
      setTickets(generateSupportTickets())
      setLoading(false)
    }, 1000)
  }, [])

  const handleAction = (action: string, id: string) => {
    if (action === 'view') {
      const ticket = tickets.find(t => t.id === id)
      if (ticket) {
        setSelectedTicket(ticket)
      }
    }
    console.log(`Action: ${action}, Ticket: ${id}`)
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = searchTerm === '' || 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === '' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === '' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === '' || ticket.category === categoryFilter

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  if (loading || !metrics) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32" />
          ))}
        </div>
        <div className="bg-gray-200 rounded-lg h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Support Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value={metrics.total}
          icon={MessageSquare}
          color="blue"
          subtitle={`${metrics.newToday} new today`}
        />
        <MetricCard
          title="Open Tickets"
          value={metrics.open}
          icon={AlertTriangle}
          color="red"
          subtitle={`${metrics.inProgress} in progress`}
        />
        <MetricCard
          title="Avg Response Time"
          value={metrics.avgResponseTime}
          icon={Clock}
          format="hours"
          color="yellow"
        />
        <MetricCard
          title="Customer Satisfaction"
          value={metrics.satisfactionScore}
          icon={Star}
          format="rating"
          color="green"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Resolved Tickets"
          value={metrics.resolved}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={metrics.avgResolutionTime}
          icon={RefreshCw}
          format="hours"
          color="blue"
        />
      </div>

      {/* Tickets Management */}
      <div className="bg-white shadow rounded-lg">
        {/* Controls */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All categories</option>
                <option value="technical">Technical</option>
                <option value="billing">Billing</option>
                <option value="feature_request">Feature Request</option>
                <option value="bug_report">Bug Report</option>
                <option value="general">General</option>
              </select>
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.slice(0, 20).map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  onAction={handleAction}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {Math.min(20, filteredTickets.length)} of {filteredTickets.length} tickets
            </p>
          </div>
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-screen overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Ticket #{selectedTicket.id}
                </h2>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Ticket Header */}
                <div className="border-b border-gray-200 pb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {selectedTicket.subject}
                  </h3>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {selectedTicket.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Priority</p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Category</p>
                      <p className="text-sm text-gray-900 capitalize">{selectedTicket.category.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="text-sm text-gray-900">{selectedTicket.createdAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">Customer</p>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{selectedTicket.customerName}</span>
                      <Mail className="h-4 w-4 text-gray-400 ml-4 mr-2" />
                      <span className="text-sm text-gray-900">{selectedTicket.customerEmail}</span>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Conversation</h4>
                  <div className="space-y-4">
                    {selectedTicket.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.isFromCustomer ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-lg p-4 rounded-lg ${
                          message.isFromCustomer 
                            ? 'bg-gray-100 text-gray-900' 
                            : 'bg-blue-600 text-white'
                        }`}>
                          <div className="flex items-center mb-2">
                            <span className="text-sm font-medium">
                              {message.authorName}
                            </span>
                            <span className="text-xs opacity-75 ml-2">
                              {message.createdAt.toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">
                      Mark Resolved
                    </button>
                    <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md">
                      Assign to Me
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md"
                    >
                      Close
                    </button>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                      Add Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}