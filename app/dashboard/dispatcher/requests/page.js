'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  ClipboardList, Calendar, MapPin, User, RefreshCw, Settings,
  Timer, CheckCircle2, AlertCircle, Search, Filter, Eye, Truck, Users
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const DispatcherRequestsPage = () => {
  const { data: session } = useSession()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [availableTrucks, setAvailableTrucks] = useState([])
  const [availableDrivers, setAvailableDrivers] = useState([])
  const [selectedTruck, setSelectedTruck] = useState('')
  const [selectedDriver, setSelectedDriver] = useState('')
  const [isAssigning, setIsAssigning] = useState(false)

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
      console.error('Requests fetch error:', error)
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableResources = async () => {
    try {
      const [trucksResponse, driversResponse] = await Promise.all([
        axios.get('/api/trucks?available=true'),
        axios.get('/api/drivers?available=true')
      ])
      setAvailableTrucks(trucksResponse.data.data.trucks || [])
      setAvailableDrivers(driversResponse.data.data.drivers || [])
    } catch (error) {
      console.error('Resources fetch error:', error)
      toast.error('Failed to load available resources')
    }
  }

  const handleAssignRequest = async (request) => {
    setSelectedRequest(request)
    setSelectedTruck('')
    setSelectedDriver('')
    await fetchAvailableResources()
  }

  const handleAssignTruck = async () => {
    if (!selectedTruck || !selectedDriver || !selectedRequest) {
      toast.error('Please select both truck and driver')
      return
    }

    try {
      setIsAssigning(true)
      const response = await axios.put(`/api/truck-requests/${selectedRequest._id}/assign`, {
        truckId: selectedTruck,
        driverId: selectedDriver
      })

      if (response.data.success) {
        toast.success('Truck and driver assigned successfully!')
        setSelectedRequest(null)
        fetchRequests()
      }
    } catch (error) {
      console.error('Assignment error:', error)
      toast.error(error.response?.data?.message || 'Failed to assign truck and driver')
    } finally {
      setIsAssigning(false)
    }
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

  const getStatusVariant = (status) => {
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
      low: 'default',
      normal: 'secondary',
      medium: 'secondary',
      high: 'destructive',
      urgent: 'destructive'
    }
    return colors[priority] || 'default'
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.loadDescription?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.pickupLocation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.deliveryLocation?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const requestStats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    assigned: requests.filter(r => r.status === 'assigned').length,
    inProgress: requests.filter(r => r.status === 'in_progress').length,
    completed: requests.filter(r => r.status === 'completed').length,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading requests...</p>
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
                <h1 className="text-3xl font-bold mb-1">All Transportation Requests</h1>
                <p className="text-primary-foreground/80">Monitor and manage all transportation requests</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={fetchRequests} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 px-3 py-1">
                {filteredRequests.length} Requests
              </Badge>
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
              <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.assigned}</h3>
              <p className="text-muted-foreground text-sm">Assigned</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-secondary-foreground" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.inProgress}</h3>
              <p className="text-muted-foreground text-sm">In Progress</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{requestStats.completed}</h3>
              <p className="text-muted-foreground text-sm">Completed</p>
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
                    placeholder="Search by description, location, or ID..."
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
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
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
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <span>Transportation Requests</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No requests found</h3>
                <p className="text-muted-foreground">
                  {requests.length === 0
                    ? "No transportation requests in the system"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Requester</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <TableRow key={request._id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="font-mono text-sm bg-muted px-2 py-1 rounded w-fit">
                            #{request._id?.slice(-6)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{request.requesterId?.name || 'Unknown'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-foreground line-clamp-2 max-w-[200px]">
                            {request.loadDescription}
                          </p>
                          {request.estimatedWeight && (
                            <p className="text-sm text-muted-foreground mt-1">~{request.estimatedWeight}kg</p>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground truncate max-w-[120px]">
                                {request.pickupLocation}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <MapPin className="h-3 w-3 text-destructive" />
                              <span className="text-muted-foreground truncate max-w-[120px]">
                                {request.deliveryLocation}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getPriorityColor(request.priority)} className="capitalize">
                            {request.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(request.status)} className="capitalize">
                            {request.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === 'pending' && (
                              <Button
                                size="sm"
                                className="bg-primary hover:bg-primary/90"
                                onClick={() => handleAssignRequest(request)}
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Assign
                              </Button>
                            )}
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

        {/* Assignment Modal */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-primary" />
                <span>Assign Truck & Driver - #{selectedRequest?._id?.slice(-6)}</span>
              </DialogTitle>
            </DialogHeader>
            {selectedRequest && (
              <div className="space-y-6">
                {/* Request Details */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Request Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">Load Description</h4>
                      <p className="text-muted-foreground mt-1">{selectedRequest.loadDescription}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-foreground">Pickup Location</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{selectedRequest.pickupLocation}</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">Delivery Location</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="h-4 w-4 text-destructive" />
                          <span className="text-muted-foreground">{selectedRequest.deliveryLocation}</span>
                        </div>
                      </div>
                    </div>
                    {selectedRequest.estimatedWeight && (
                      <div>
                        <h4 className="font-medium text-foreground">Estimated Weight</h4>
                        <p className="text-muted-foreground mt-1">{selectedRequest.estimatedWeight} kg</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Assignment Section */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Truck className="h-5 w-5 text-primary" />
                        <span>Select Truck</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedTruck} onValueChange={setSelectedTruck}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose available truck" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]" position="popper" sideOffset={4}>
                          {availableTrucks.map((truck) => (
                            <SelectItem key={truck._id} value={truck._id}>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{truck.truckNumber}</span>
                                <span className="text-muted-foreground">- {truck.plateNumber}</span>
                                <Badge variant="outline">{truck.type}</Badge>
                                <span className="text-sm">({truck.capacity}kg)</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableTrucks.length === 0 && (
                        <p className="text-muted-foreground text-sm mt-2">No available trucks</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-primary" />
                        <span>Select Driver</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose available driver" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]" position="popper" sideOffset={4}>
                          {availableDrivers.map((driver) => (
                            <SelectItem key={driver._id} value={driver._id}>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">{driver.userId?.name}</span>
                                <span className="text-muted-foreground">- {driver.licenseNumber}</span>
                                <Badge variant="outline">{driver.licenseType}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableDrivers.length === 0 && (
                        <p className="text-muted-foreground text-sm mt-2">No available drivers</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Assignment Button */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAssignTruck}
                    disabled={!selectedTruck || !selectedDriver || isAssigning}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isAssigning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground/20 border-t-primary-foreground mr-2"></div>
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Assign Truck & Driver
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}

export default DispatcherRequestsPage