'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell, RefreshCw, Search, Filter, CheckCircle2, AlertCircle, Clock,
  User, Truck, Settings, Mail, ExternalLink, BellRing, Calendar
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const DispatcherNotificationsPage = () => {
  const { data: session } = useSession()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [readFilter, setReadFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/notifications')
      setNotifications(response.data.data.notifications || [])
    } catch (error) {
      console.error('Notifications fetch error:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`)
      setNotifications(prev => prev.map(notif =>
        notif._id === notificationId ? { ...notif, isRead: true } : notif
      ))
      toast.success('Notification marked as read')
    } catch (error) {
      console.error('Mark as read error:', error)
      toast.error('Failed to mark as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/mark-all-read')
      setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Mark all as read error:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const getNotificationIcon = (type) => {
    const icons = {
      assignment: <Truck className="h-4 w-4" />,
      status_update: <CheckCircle2 className="h-4 w-4" />,
      system: <Settings className="h-4 w-4" />,
      alert: <AlertCircle className="h-4 w-4" />,
      reminder: <Clock className="h-4 w-4" />
    }
    return icons[type] || <Bell className="h-4 w-4" />
  }

  const getNotificationColor = (type) => {
    const colors = {
      assignment: 'text-primary',
      status_update: 'text-primary',
      system: 'text-muted-foreground',
      alert: 'text-destructive',
      reminder: 'text-muted-foreground'
    }
    return colors[type] || 'text-primary'
  }

  const getTypeVariant = (type) => {
    const variants = {
      assignment: 'default',
      status_update: 'default',
      system: 'secondary',
      alert: 'destructive',
      reminder: 'outline'
    }
    return variants[type] || 'secondary'
  }

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    const matchesRead = readFilter === 'all' ||
                       (readFilter === 'unread' && !notification.isRead) ||
                       (readFilter === 'read' && notification.isRead)
    return matchesSearch && matchesType && matchesRead
  })

  const notificationStats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.isRead).length,
    assignment: notifications.filter(n => n.type === 'assignment').length,
    statusUpdate: notifications.filter(n => n.type === 'status_update').length,
    alerts: notifications.filter(n => n.type === 'alert').length,
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            <p className="text-muted-foreground animate-pulse">Loading notifications...</p>
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
                <Bell className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-1">Notifications</h1>
                <p className="text-primary-foreground/80">Stay updated with system activities and alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="secondary" size="sm" onClick={fetchNotifications} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              {notificationStats.unread > 0 && (
                <Button variant="secondary" size="sm" onClick={markAllAsRead} className="bg-primary-foreground/20 border-0 text-primary-foreground hover:bg-primary-foreground/30">
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark All Read
                </Button>
              )}
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-0 px-3 py-1">
                {notificationStats.unread} Unread
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Bell className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{notificationStats.total}</h3>
              <p className="text-muted-foreground text-sm">Total Notifications</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <BellRing className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <h3 className="text-2xl font-bold text-foreground">{notificationStats.unread}</h3>
              <p className="text-muted-foreground text-sm">Unread</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{notificationStats.assignment}</h3>
              <p className="text-muted-foreground text-sm">Assignments</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <h3 className="text-2xl font-bold text-foreground">{notificationStats.statusUpdate}</h3>
              <p className="text-muted-foreground text-sm">Status Updates</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-card hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4 text-center">
              <AlertCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <h3 className="text-2xl font-bold text-foreground">{notificationStats.alerts}</h3>
              <p className="text-muted-foreground text-sm">Alerts</p>
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
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-0 bg-muted focus:bg-background transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={readFilter} onValueChange={setReadFilter}>
                  <SelectTrigger className="w-[120px] border-0 bg-muted">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px] border-0 bg-muted">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="status_update">Status Update</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary" />
              <span>All Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-medium text-foreground mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {notifications.length === 0
                    ? "You're all caught up! No notifications yet"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`border rounded-lg p-4 transition-all duration-300 hover:shadow-md cursor-pointer ${
                      notification.isRead ? 'bg-muted/30 border-border' : 'bg-background border-primary/20 shadow-sm'
                    }`}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-2 rounded-lg bg-muted ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h4 className={`font-medium ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'}`}>
                                {notification.title}
                              </h4>
                              <Badge variant={getTypeVariant(notification.type)} className="text-xs">
                                {notification.type.replace('_', ' ')}
                              </Badge>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                              )}
                            </div>
                            <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-muted-foreground'}`}>
                              {notification.message}
                            </p>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatTimeAgo(notification.createdAt)}</span>
                            </div>
                            {notification.senderId && (
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                <span>{notification.senderId.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {notification.data?.actionUrl && (
                          <div className="flex justify-start">
                            <Button size="sm" variant="outline" className="text-xs">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              View Details
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default DispatcherNotificationsPage