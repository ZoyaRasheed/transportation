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
  Truck, RefreshCw, Search, Filter, Plus, Eye, Settings,
  MapPin, User, Wrench, CheckCircle2, AlertCircle, Clock
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const DispatcherFleetPage = () => {
  const { data: session } = useSession()
  const [trucks, setTrucks] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTruck, setSelectedTruck] = useState(null)

  useEffect(() => {
    if (session?.user) {
      fetchTrucks()
    }
  }, [session])

  const fetchTrucks = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/trucks')
      setTrucks(response.data.data.trucks || [])
    } catch (error) {
      console.error('Trucks fetch error:', error)
      toast.error('Failed to load trucks')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      available: 'bg-primary',
      assigned: 'bg-secondary',
      maintenance: 'bg-muted-foreground',
      out_of_service: 'bg-destructive'
    }
    return colors[status] || 'bg-muted-foreground'
  }

  const getStatusVariant = (status) => {
    const variants = {
      available: 'default',
      assigned: 'secondary',
      maintenance: 'outline',
      out_of_service: 'destructive'
    }
    return variants[status] || 'secondary'
  }

  const getTypeIcon = (type) => {
    return <Truck className="h-4 w-4" />
  }

  const filteredTrucks = trucks.filter(truck => {
    const matchesSearch = truck.truckNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.plateNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         truck.type?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || truck.status === statusFilter
    const matchesType = typeFilter === 'all' || truck.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const truckStats = {
    total: trucks.length,
    available: trucks.filter(t => t.status === 'available').length,
    assigned: trucks.filter(t => t.status === 'assigned').length,
    maintenance: trucks.filter(t => t.status === 'maintenance').length,
    outOfService: trucks.filter(t => t.status === 'out_of_service').length,
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading fleet...</p>
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
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Fleet Management</h1>
                <p className="text-primary-foreground/80">Monitor and manage all transportation vehicles</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={fetchTrucks} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 px-3 py-1">
                {filteredTrucks.length} Trucks
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{truckStats.total}</h3>
              <p className="text-muted-foreground text-sm">Total Fleet</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{truckStats.available}</h3>
              <p className="text-muted-foreground text-sm">Available</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Settings className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{truckStats.assigned}</h3>
              <p className="text-muted-foreground text-sm">Assigned</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Wrench className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-2xl font-bold text-foreground">{truckStats.maintenance}</h3>
              <p className="text-muted-foreground text-sm">Maintenance</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <h3 className="text-2xl font-bold text-foreground">{truckStats.outOfService}</h3>
              <p className="text-muted-foreground text-sm">Out of Service</p>
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
                    placeholder="Search by truck number, plate, or type..."
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
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="out_of_service">Out of Service</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] border-0 bg-muted">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pickup">Pickup</SelectItem>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="trailer">Trailer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trucks Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Fleet Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTrucks.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No trucks found</h3>
                <p className="text-muted-foreground">
                  {trucks.length === 0
                    ? "No trucks in the fleet"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Truck Info</TableHead>
                      <TableHead>Type & Capacity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Current Assignment</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrucks.map((truck) => (
                      <TableRow key={truck._id} className="hover:bg-muted/50 transition-colors">
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {getTypeIcon(truck.type)}
                              <span className="font-mono text-sm font-medium">{truck.truckNumber}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Plate: {truck.plateNumber}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge variant="outline" className="capitalize">
                              {truck.type}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {truck.capacity}kg capacity
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusVariant(truck.status)} className="capitalize">
                            {truck.status?.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {truck.assignedDriverId ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1 text-sm">
                                <User className="h-3 w-3 text-primary" />
                                <span className="font-medium">{truck.assignedDriverId.name}</span>
                              </div>
                              {truck.currentRequestId && (
                                <div className="text-xs text-muted-foreground">
                                  Request: {truck.currentRequestId.loadId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground truncate max-w-[120px]">
                              {truck.currentLocation || 'Unknown'}
                            </span>
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
                                  onClick={() => setSelectedTruck(truck)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center space-x-2">
                                    <Truck className="h-5 w-5 text-primary" />
                                    <span>Truck Details - {truck.truckNumber}</span>
                                  </DialogTitle>
                                </DialogHeader>
                                {selectedTruck && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Basic Information</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="text-muted-foreground">Truck Number:</span> {selectedTruck.truckNumber}</p>
                                          <p><span className="text-muted-foreground">Plate Number:</span> {selectedTruck.plateNumber}</p>
                                          <p><span className="text-muted-foreground">Type:</span> {selectedTruck.type}</p>
                                          <p><span className="text-muted-foreground">Capacity:</span> {selectedTruck.capacity}kg</p>
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Status & Assignment</h4>
                                        <div className="space-y-1 text-sm">
                                          <p><span className="text-muted-foreground">Status:</span>
                                            <Badge variant={getStatusVariant(selectedTruck.status)} className="ml-2 capitalize">
                                              {selectedTruck.status?.replace('_', ' ')}
                                            </Badge>
                                          </p>
                                          <p><span className="text-muted-foreground">Driver:</span> {selectedTruck.assignedDriverId?.name || 'Unassigned'}</p>
                                          <p><span className="text-muted-foreground">Current Request:</span> {selectedTruck.currentRequestId?.loadId || 'None'}</p>
                                          <p><span className="text-muted-foreground">Location:</span> {selectedTruck.currentLocation || 'Unknown'}</p>
                                        </div>
                                      </div>
                                    </div>
                                    {selectedTruck.specifications && (
                                      <div className="space-y-2">
                                        <h4 className="font-medium text-foreground">Specifications</h4>
                                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                                          {selectedTruck.specifications}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                            {truck.status === 'available' && (
                              <Button size="sm" className="bg-primary hover:bg-primary/90">
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
      </div>
    </DashboardLayout>
  )
}

export default DispatcherFleetPage