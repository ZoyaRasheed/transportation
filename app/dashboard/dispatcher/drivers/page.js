'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Users, RefreshCw, Search, Filter, Plus, Eye, Phone, Mail,
  MapPin, User, CheckCircle2, AlertCircle, Clock, Truck, Calendar, CreditCard
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const DispatcherDriversPage = () => {
  const { data: session } = useSession()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDriver, setSelectedDriver] = useState(null)

  useEffect(() => {
    if (session?.user) {
      fetchDrivers()
    }
  }, [session])

  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/drivers')
      setDrivers(response.data.data.drivers || [])
    } catch (error) {
      console.error('Drivers fetch error:', error)
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-primary',
      assigned: 'bg-secondary',
      on_trip: 'bg-muted-foreground',
      on_leave: 'bg-muted',
      off_duty: 'bg-destructive'
    }
    return colors[status] || 'bg-muted-foreground'
  }

  const getStatusVariant = (status) => {
    const variants = {
      available: 'default',
      assigned: 'secondary',
      on_trip: 'outline',
      on_leave: 'outline',
      off_duty: 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const getLicenseTypeColor = (type) => {
    const colors = {
      'Class A': 'bg-primary',
      'Class B': 'bg-secondary',
      'Class C': 'bg-muted',
      'CDL': 'bg-accent'
    }
    return colors[type] || 'bg-muted-foreground'
  }

  const filteredDrivers = drivers.filter(driver => {
    const driverName = driver.userId?.name || ''
    const licenseNumber = driver.licenseNumber || ''
    const phone = driver.phone || ''

    const matchesSearch = driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phone.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const driverStats = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'available').length,
    assigned: drivers.filter(d => d.status === 'assigned').length,
    onTrip: drivers.filter(d => d.status === 'on_trip').length,
    onLeave: drivers.filter(d => d.status === 'on_leave').length,
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading drivers...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl p-3">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Driver Management</h1>
                <p className="text-primary-foreground/80">Monitor and manage all transportation drivers</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={fetchDrivers} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 px-3 py-1">
                {filteredDrivers.length} Drivers
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{driverStats.total}</h3>
              <p className="text-muted-foreground text-sm">Total Drivers</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{driverStats.available}</h3>
              <p className="text-muted-foreground text-sm">Available</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <User className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{driverStats.assigned}</h3>
              <p className="text-muted-foreground text-sm">Assigned</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{driverStats.onTrip}</h3>
              <p className="text-muted-foreground text-sm">On Trip</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-2xl font-bold text-foreground">{driverStats.onLeave}</h3>
              <p className="text-muted-foreground text-sm">On Leave</p>
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
                    placeholder="Search by name, license, or phone..."
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="on_trip">On Trip</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                    <SelectItem value="off_duty">Off Duty</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Drivers Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>Driver Directory</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredDrivers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No drivers found</h3>
                <p className="text-muted-foreground">
                  {drivers.length === 0
                    ? "No drivers in the system"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Driver Info</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>License</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Assignment</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDrivers.map((driver) => (
                      <TableRow key={driver._id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-primary" />
                              <span className="font-medium">{driver.userId?.name || 'Unknown'}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {driver.userId?._id?.slice(-6)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm">
                              <Phone className="h-3 w-3 text-primary" />
                              <span>{driver.phone}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">{driver.userId?.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="text-xs">
                              {driver.licenseType}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {driver.licenseNumber}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Exp: {formatDate(driver.licenseExpiry)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(driver.status)} className="capitalize">
                            {driver.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {driver.currentTruckId ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <Truck className="h-3 w-3 text-primary" />
                                <span className="font-medium">
                                  {driver.currentTruckId.truckNumber || 'Truck Assigned'}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {driver.currentTruckId.type || 'Vehicle'}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>{driver.experience || 0} years</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setSelectedDriver(driver)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-primary" />
                                    <span>Driver Profile - {driver.userId?.name}</span>
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedDriver && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Personal Information</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="text-muted-foreground">Name:</span> {selectedDriver.userId?.name}</p>
                                          <p><span className="text-muted-foreground">Email:</span> {selectedDriver.userId?.email}</p>
                                          <p><span className="text-muted-foreground">Phone:</span> {selectedDriver.phone}</p>
                                          <p><span className="text-muted-foreground">Experience:</span> {selectedDriver.experience || 0} years</p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">License & Status</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="text-muted-foreground">License Type:</span>
                                            <Badge variant="outline" className="ml-2">
                                              {selectedDriver.licenseType}
                                            </Badge>
                                          </p>
                                          <p><span className="text-muted-foreground">License Number:</span> {selectedDriver.licenseNumber}</p>
                                          <p><span className="text-muted-foreground">Expiry Date:</span> {formatDate(selectedDriver.licenseExpiry)}</p>
                                          <p><span className="text-muted-foreground">Status:</span>
                                            <Badge variant={getStatusVariant(selectedDriver.status)} className="ml-2 capitalize">
                                              {selectedDriver.status?.replace('_', ' ')}
                                            </Badge>
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                    {selectedDriver.address && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Address</h4>
                                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                          {selectedDriver.address}
                                        </div>
                                      </div>
                                    )}
                                    {selectedDriver.emergencyContact && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Emergency Contact</h4>
                                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                          {selectedDriver.emergencyContact}
                                        </div>
                                      </div>
                                    )}
                                    {selectedDriver.currentTruckId && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Current Assignment</h4>
                                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                          <div className="flex items-center space-x-2">
                                            <Truck className="h-4 w-4" />
                                            <span>Truck: {selectedDriver.currentTruckId.truckNumber}</span>
                                          </div>
                                          <div className="mt-1">Type: {selectedDriver.currentTruckId.type}</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
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
      </div>
    </DashboardLayout>
  )
}

export default DispatcherDriversPage