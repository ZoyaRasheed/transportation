'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Truck, MapPin, CheckCircle2, Clock, Calendar, Bell, TrendingUp,
  RefreshCw, Activity, BarChart3, Package, Timer, User, Award,
  Navigation, Route, AlertCircle
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const DriverDashboard = () => {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user) {
      fetchDashboardData()
    }
  }, [session])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/dashboard/driver')
      setDashboardData(response.data.data)
    } catch (error) {
      console.error('Dashboard fetch error:', error)
      if (error.response?.status === 404) {
        toast.error('Driver profile not found. Please contact admin.')
      } else {
        toast.error('Failed to load dashboard data')
      }
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    toast.loading('Refreshing data...', { id: 'refresh' })
    await fetchDashboardData()
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

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4 text-center">
            <AlertCircle className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="text-lg font-medium">Unable to load dashboard</h3>
            <p className="text-muted-foreground">Please contact your administrator</p>
            <Button onClick={refreshData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
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
                <Truck className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Welcome back, {dashboardData?.user?.name?.split(' ')[0]}!</h1>
                <p className="text-primary-foreground/80">Track your deliveries and manage your trips</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={refreshData} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 px-3 py-1">
                {dashboardData?.driverProfile?.status === 'available' ? '🟢 Available' :
                 dashboardData?.driverProfile?.status === 'on_trip' ? '🔵 On Trip' :
                 dashboardData?.driverProfile?.status === 'assigned' ? '🟡 Assigned' : '⚪ Off Duty'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Driver Profile Card */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-card to-card/80">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-full p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Number</p>
                  <p className="font-semibold">{dashboardData?.driverProfile?.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-secondary/50 rounded-full p-3">
                  <Award className="h-6 w-6 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">License Type</p>
                  <p className="font-semibold">{dashboardData?.driverProfile?.licenseType}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-accent/50 rounded-full p-3">
                  <Truck className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Current Truck</p>
                  <p className="font-semibold">
                    {dashboardData?.driverProfile?.currentTruck?.truckNumber || 'Not Assigned'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-muted rounded-full p-3">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Experience</p>
                  <p className="font-semibold">{dashboardData?.driverProfile?.experience?.years || 0} years</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Total Trips</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.totalTrips || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    All time deliveries
                  </p>
                </div>
                <div className="bg-primary/10 rounded-full p-3">
                  <Route className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">Completed Trips</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.completedTrips || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Successfully delivered
                  </p>
                </div>
                <div className="bg-accent/50 rounded-full p-3">
                  <CheckCircle2 className="h-6 w-6 text-accent-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">In Progress</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.inProgressTrips || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <Navigation className="h-3 w-3 mr-1" />
                    Active deliveries
                  </p>
                </div>
                <div className="bg-secondary/50 rounded-full p-3">
                  <Navigation className="h-6 w-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">This Month</p>
                  <h3 className="text-3xl font-bold text-foreground mt-1">{dashboardData?.stats?.monthlyTrips || 0}</h3>
                  <p className="text-muted-foreground text-xs mt-1 flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Monthly deliveries
                  </p>
                </div>
                <div className="bg-muted rounded-full p-3">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Trip Card */}
        {dashboardData?.currentTrip && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Navigation className="h-5 w-5 text-primary" />
                <span>Current Active Trip</span>
                <Badge variant="outline" className="bg-orange-500 text-white border-0">
                  In Progress
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Load Details</h4>
                  <p className="text-muted-foreground">{dashboardData.currentTrip.loadDescription}</p>
                  {dashboardData.currentTrip.estimatedWeight && (
                    <p className="text-sm text-muted-foreground mt-1">Weight: {dashboardData.currentTrip.estimatedWeight} kg</p>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Route</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{dashboardData.currentTrip.pickupLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">{dashboardData.currentTrip.deliveryLocation}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Truck Details</h4>
                  <p className="text-muted-foreground">
                    {dashboardData.currentTrip.assignedTruck?.truckId?.truckNumber || 'N/A'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dashboardData.currentTrip.assignedTruck?.truckId?.plateNumber || 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress Overview & Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <span>Trip Status Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(dashboardData?.statusBreakdown || {}).map(([status, count]) => {
                  const total = dashboardData?.stats?.totalTrips || 1
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

        {/* Assignment History */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Recent Assignments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData?.assignedRequests?.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No assignments yet</h3>
                <p className="text-muted-foreground">Your trip assignments will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border">
                      <TableHead className="font-semibold">Request ID</TableHead>
                      <TableHead className="font-semibold">Description</TableHead>
                      <TableHead className="font-semibold">Route</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Assigned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.assignedRequests?.map((request) => (
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
                              <span className="text-muted-foreground truncate max-w-[120px]">{request.deliveryLocation}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(request.status)} className="capitalize">
                            {request.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {request.assignedTruck?.assignedAt && (
                              <>
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-3 w-3" />
                                  <span>{new Date(request.assignedTruck.assignedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="text-xs text-muted-foreground/70 mt-1">
                                  {new Date(request.assignedTruck.assignedAt).toLocaleTimeString()}
                                </div>
                              </>
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

export default DriverDashboard
