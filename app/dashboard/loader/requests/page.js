'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ClipboardList, Search, Filter, Eye, MoreHorizontal, MapPin, Calendar,
  Clock, Truck, Package, AlertCircle, CheckCircle2, Timer, Zap,
  RefreshCw, TrendingUp, ArrowUpRight, Download
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const MyRequestsPage = () => {
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      fetchRequests()
    }
  }, [session])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/truck-requests')
      setRequests(response.data.data.requests || [])
    } catch (error) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    toast.loading('Refreshing requests...', { id: 'refresh' })
    await fetchRequests()
    toast.success('Requests refreshed!', { id: 'refresh' })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    }
    return colors[status] || 'bg-muted-foreground'
  }

  const getStatusBadgeVariant = (status) => {
    const variants = {
      pending: 'secondary',
      assigned: 'default',
      in_progress: 'outline',
      completed: 'default',
      cancelled: 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive'
    }
    return colors[priority] || 'default'
  }

  const filterByDate = (request) => {
    if (dateFilter === 'all') return true
    const now = new Date()
    const requestDate = new Date(request.createdAt)

    switch (dateFilter) {
      case 'today':
        return requestDate.toDateString() === now.toDateString()
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return requestDate >= weekAgo
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return requestDate >= monthAgo
      default:
        return true
    }
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.loadDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    const matchesDate = filterByDate(request)
    return matchesSearch && matchesStatus && matchesPriority && matchesDate
  })

  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    completed: requests.filter(r => r.status === 'completed').length,
    high: requests.filter(r => r.priority === 'high').length
  }

  const openRequestDetails = (request) => {
    setSelectedRequest(request)
    setIsDetailModalOpen(true)
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading your requests...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl p-3">
                <ClipboardList className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">My Transportation Requests</h1>
                <p className="text-primary-foreground/80">Track and manage all your truck requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={refreshData} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="secondary" size="sm" className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <ClipboardList className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.total}</h3>
              <p className="text-muted-foreground text-sm">Total Requests</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Timer className="h-6 w-6 mx-auto mb-2 text-secondary-foreground" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.pending}</h3>
              <p className="text-muted-foreground text-sm">Pending</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.assigned}</h3>
              <p className="text-muted-foreground text-sm">Assigned</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.completed}</h3>
              <p className="text-muted-foreground text-sm">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.high}</h3>
              <p className="text-muted-foreground text-sm">High Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search by description, location, or request ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-muted focus:bg-background transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] border-0 bg-muted">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px] border-0 bg-muted">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[140px] border-0 bg-gray-50">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Transportation Requests</span>
              </CardTitle>
              <Badge variant="outline" className="text-muted-foreground">
                {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                <p className="text-muted-foreground mb-6">
                  {requests.length === 0
                    ? "You haven't created any requests yet"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-200">
                      <TableHead className="font-semibold">Request ID</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Route</TableHead>
                      <TableHead className="font-semibold">Priority</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Created</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request._id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-mono text-sm bg-muted px-2 py-1 rounded w-fit">
                            #{request._id.slice(-6)}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[250px]">
                          <p className="font-medium text-foreground line-clamp-2">{request.loadDescription}</p>
                          {request.estimatedWeight && (
                            <p className="text-sm text-muted-foreground mt-1">~{request.estimatedWeight}kg</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground truncate max-w-[150px]">{request.pickupLocation}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-3 w-3 text-destructive" />
                              <span className="text-muted-foreground truncate max-w-[150px]">{request.destination}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`}></div>
                            <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                              {request.status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-muted-foreground/70 mt-1">
                              {new Date(request.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => openRequestDetails(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Details Modal */}
        <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Request Details - #{selectedRequest?._id.slice(-6)}</span>
              </DialogTitle>
              <DialogDescription>
                Complete information about your transportation request
              </DialogDescription>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedRequest.status)}`}></div>
                      <Badge variant={getStatusBadgeVariant(selectedRequest.status)} className="capitalize">
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <div className="mt-1">
                      <Badge variant={getPriorityColor(selectedRequest.priority)} className="capitalize">
                        {selectedRequest.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Load Description</Label>
                  <p className="mt-1 text-foreground">{selectedRequest.loadDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Pickup Location</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-foreground">{selectedRequest.pickupLocation}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Destination</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-destructive" />
                      <span className="text-foreground">{selectedRequest.destination}</span>
                    </div>
                  </div>
                </div>

                {selectedRequest.estimatedWeight && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Estimated Weight</Label>
                    <p className="mt-1 text-foreground">{selectedRequest.estimatedWeight} kg</p>
                  </div>
                )}

                {selectedRequest.specialInstructions && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Special Instructions</Label>
                    <p className="mt-1 text-foreground">{selectedRequest.specialInstructions}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                    <p className="mt-1 text-foreground">
                      {new Date(selectedRequest.createdAt).toLocaleDateString()} at{' '}
                      {new Date(selectedRequest.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Request ID</Label>
                    <p className="mt-1 font-mono text-foreground">#{selectedRequest._id.slice(-6)}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default MyRequestsPage