'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Package, Truck, Clock, Plus, Eye, MapPin, Calendar, Bell, TrendingUp,
  Filter, Search, RefreshCw, CheckCircle2, Timer,
  MoreHorizontal, Target,
  Activity, BarChart3, PieChart, Zap
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const LoaderDashboard = () => {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [selectedRequest, setSelectedRequest] = useState(null)

  const [newRequest, setNewRequest] = useState({
    loadDescription: '',
    priority: 'normal',
    pickupLocation: '',
    destination: '',
    estimatedWeight: '',
    requiredBy: '',
    specialInstructions: ''
  })

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
      fetchRequests()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/dashboard/loader')
      setDashboardData(response.data.data)
    } catch (error) {
      toast.error('Failed to load dashboard data')
    }
  }

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/truck-requests')
      setRequests(response.data.data.requests || [])
    } catch (error) {
      toast.error('Failed to load truck requests')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRequest = async () => {
    if (!newRequest.loadDescription || !newRequest.pickupLocation || !newRequest.destination) {
      toast.error('Please fill in all required fields')
      return
    }

    try {
      setIsSubmitting(true)

      // Generate a unique load ID
      const loadId = `LD${Date.now()}`

      // Map form data to API expected fields
      const requestData = {
        loadId,
        loadDescription: newRequest.loadDescription,
        priority: newRequest.priority,
        pickupLocation: newRequest.pickupLocation,
        deliveryLocation: newRequest.destination, // Map destination to deliveryLocation
        estimatedWeight: newRequest.estimatedWeight ? Number(newRequest.estimatedWeight) : undefined,
        requiredTime: newRequest.requiredBy || undefined, // Map requiredBy to requiredTime
        notes: newRequest.specialInstructions || undefined // Map specialInstructions to notes
      }

      const response = await axios.post('/api/truck-requests', requestData)

      if (response.data.success) {
        toast.success('🚚 Truck request created successfully!')
        setIsCreateModalOpen(false)
        setNewRequest({
          loadDescription: '',
          priority: 'normal',
          pickupLocation: '',
          destination: '',
          estimatedWeight: '',
          requiredBy: '',
          specialInstructions: ''
        })
        fetchRequests()
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Request creation error:', error)
      toast.error(error.response?.data?.message || 'Failed to create truck request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const refreshData = async () => {
    toast.loading('Refreshing data...', { id: 'refresh' })
    await Promise.all([fetchDashboardData(), fetchRequests()])
    toast.success('Data refreshed!', { id: 'refresh' })
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      assigned: 'bg-blue-500',
      in_progress: 'bg-orange-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
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
      normal: 'default',
      high: 'destructive',
      urgent: 'destructive'
    }
    return colors[priority] || 'default'
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.loadDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.destination.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading && !dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header Section */}
        <div className="bg-linear-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Welcome back, {dashboardData?.user?.name?.split(' ')[0]}!</h1>
                <p className="text-primary-foreground/80">Manage your transportation requests efficiently</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={refreshData} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 px-3 py-1">
                Loading Department
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Today&apos;s Requests</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.todayRequests || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% vs yesterday
                  </p>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Pending Requests</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.pendingRequests || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <Timer className="h-3 w-3 mr-1" />
                    Awaiting assignment
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-full p-3">
                  <Clock className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed Today</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.todayCompleted || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Successfully delivered
                  </p>
                </div>
                <div className="bg-accent/50 rounded-full p-3">
                  <Truck className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Response Time</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.averageResponseTime || '0m'}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <Zap className="h-3 w-3 mr-1" />
                    Average assignment
                  </p>
                </div>
                <div className="bg-muted rounded-full p-3">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Request Status Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dashboardData?.statusBreakdown || {}).map(([status, count]) => {
                  const total = dashboardData?.stats?.totalRequests || 1
                  const percentage = Math.round((count / total) * 100)
                  return (
                    <div key={status} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${getStatusColor(status)}`}></div>
                          {status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">{count} ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-secondary-foreground" />
                <span>Recent Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboardData?.recentNotifications?.slice(0, 4).map((notification, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.senderId?.image} />
                      <AvatarFallback className="text-xs">
                        {notification.senderId?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent notifications</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="requests" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2 bg-muted p-1 rounded-lg">
              <TabsTrigger value="requests" className="data-[state=active]:bg-background rounded-md px-6">
                My Requests
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-background rounded-md px-6">
                Analytics
              </TabsTrigger>
            </TabsList>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <span>Create New Truck Request</span>
                  </DialogTitle>
                  <DialogDescription>
                    Fill in the details for your transportation request. Required fields are marked with *
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loadDescription" className="text-sm font-medium">Load Description *</Label>
                      <Textarea
                        id="loadDescription"
                        placeholder="Describe what needs to be transported..."
                        value={newRequest.loadDescription}
                        onChange={(e) => setNewRequest({...newRequest, loadDescription: e.target.value})}
                        className="min-h-20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-sm font-medium">Priority Level</Label>
                      <Select value={newRequest.priority} onValueChange={(value) => setNewRequest({...newRequest, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">🟢 Low Priority</SelectItem>
                          <SelectItem value="normal">🟡 Normal Priority</SelectItem>
                          <SelectItem value="high">🔴 High Priority</SelectItem>
                          <SelectItem value="urgent">🔴 Urgent Priority</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pickupLocation" className="text-sm font-medium">Pickup Location *</Label>
                      <Input
                        id="pickupLocation"
                        placeholder="Enter pickup address..."
                        value={newRequest.pickupLocation}
                        onChange={(e) => setNewRequest({...newRequest, pickupLocation: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destination" className="text-sm font-medium">Destination *</Label>
                      <Input
                        id="destination"
                        placeholder="Enter delivery address..."
                        value={newRequest.destination}
                        onChange={(e) => setNewRequest({...newRequest, destination: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="estimatedWeight" className="text-sm font-medium">Estimated Weight (kg)</Label>
                      <Input
                        id="estimatedWeight"
                        type="number"
                        placeholder="Weight in kilograms..."
                        value={newRequest.estimatedWeight}
                        onChange={(e) => setNewRequest({...newRequest, estimatedWeight: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requiredBy" className="text-sm font-medium">Required By</Label>
                      <Input
                        id="requiredBy"
                        type="datetime-local"
                        value={newRequest.requiredBy}
                        onChange={(e) => setNewRequest({...newRequest, requiredBy: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions" className="text-sm font-medium">Special Instructions</Label>
                    <Textarea
                      id="specialInstructions"
                      placeholder="Any special handling requirements, delivery notes, etc..."
                      value={newRequest.specialInstructions}
                      onChange={(e) => setNewRequest({...newRequest, specialInstructions: e.target.value})}
                      className="min-h-20"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    disabled={isSubmitting}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Request'
                    )}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <TabsContent value="requests" className="space-y-6">
            {/* Filters */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search requests by description, location..."
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
                      </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[140px] border-0 bg-muted">
                        <Target className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priority</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
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
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary/20 border-t-primary mb-4"></div>
                    <p className="text-muted-foreground animate-pulse">Loading your requests...</p>
                  </div>
                ) : filteredRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                    <p className="text-muted-foreground mb-6">
                      {requests.length === 0
                        ? "Create your first truck request to get started"
                        : "Try adjusting your search or filter criteria"
                      }
                    </p>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Request
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="font-semibold">Request</TableHead>
                          <TableHead className="font-semibold">Description</TableHead>
                          <TableHead className="font-semibold">Route</TableHead>
                          <TableHead className="font-semibold">Priority</TableHead>
                          <TableHead className="font-semibold">Status</TableHead>
                          <TableHead className="font-semibold">Created</TableHead>
                          <TableHead className="font-semibold">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRequests.map((request, index) => (
                          <TableRow key={request._id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <div className="font-mono text-sm bg-muted px-2 py-1 rounded w-fit">
                                #{request._id.slice(-6)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <p className="font-medium text-foreground line-clamp-2">{request.loadDescription}</p>
                              {request.estimatedWeight && (
                                <p className="text-sm text-muted-foreground mt-1">~{request.estimatedWeight}kg</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center space-x-1 text-sm">
                                  <MapPin className="h-3 w-3 text-primary" />
                                  <span className="text-muted-foreground truncate max-w-[120px]">{request.pickupLocation}</span>
                                </div>
                                <div className="flex items-center space-x-1 text-sm">
                                  <MapPin className="h-3 w-3 text-destructive" />
                                  <span className="text-muted-foreground truncate max-w-[120px]">{request.destination}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                                {request.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                                {request.status.replace('_', ' ')}
                              </Badge>
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
                                  onClick={() => setSelectedRequest(request)}
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
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-secondary-foreground" />
                  <span>Performance Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Analytics Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Detailed analytics and insights will be available here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Request Details Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Request Details - #{selectedRequest?._id.slice(-6)}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(selectedRequest.status)}`}></div>
                      <Badge variant={getStatusBadgeVariant(selectedRequest.status)} className="capitalize">
                        {selectedRequest.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                    <Badge variant={getPriorityColor(selectedRequest.priority)} className="capitalize">
                      {selectedRequest.priority}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
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
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  )
}

export default LoaderDashboard