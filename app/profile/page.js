'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Mail, Phone, MapPin, Calendar, Edit, Save, X, Smartphone, MessageSquare } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const ProfilePage = () => {
  const { data: session } = useSession()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    notifications: {
      email: false,
      sms: false,
      push: false
    }
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/user/profile')
      setProfile(response.data.data)
      setEditForm({
        name: response.data.data.name || '',
        phone: response.data.data.phone || '',
        notifications: response.data.data.preferences?.notifications || {
          email: false,
          sms: false,
          push: false
        }
      })
    } catch (error) {
      toast.error('Failed to load profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setEditing(true)
  }

  const handleCancel = () => {
    setEditing(false)
    setEditForm({
      name: profile?.name || '',
      phone: profile?.phone || '',
      notifications: profile?.preferences?.notifications || {
        email: false,
        sms: false,
        push: false
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await axios.put('/api/user/profile', editForm)
      setProfile(response.data.data)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (error) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getRoleColor = (role) => {
    const colors = {
      admin: 'destructive',
      supervisor: 'default',
      dispatcher: 'secondary',
      switcher: 'outline',
      loader: 'default'
    }
    return colors[role] || 'default'
  }

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-7xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-full p-2">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Profile Settings</CardTitle>
                  <CardDescription>Manage your account information and preferences</CardDescription>
                </div>
              </div>
              {!editing ? (
                <Button onClick={handleEdit} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button onClick={handleSave} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button onClick={handleCancel} variant="outline" disabled={saving}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Profile Avatar Section */}
              <Card className="lg:col-span-1">
                <CardContent className="p-6 text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src={profile?.image} alt={profile?.name} />
                    <AvatarFallback className="text-lg">
                      {getInitials(profile?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-2">{profile?.name}</h3>
                  <Badge variant={getRoleColor(profile?.role)} className="mb-4">
                    {profile?.role?.toUpperCase()}
                  </Badge>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Unknown'}</span>
                    </div>
                    {profile?.lastLogin && (
                      <div className="flex items-center justify-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>Last login {new Date(profile.lastLogin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Profile Information Section */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Your account details and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      {editing ? (
                        <Input
                          id="name"
                          value={editForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 border rounded-md">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{profile?.email}</span>
                        
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      {editing ? (
                        <Input
                          id="phone"
                          value={editForm.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      ) : (
                        <div className="flex items-center space-x-2 p-2 border rounded-md">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{profile?.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{profile?.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{profile?.department}</span>
                      
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how you receive notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <div className="shrink-0">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="grow">
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive updates via email</p>
                      </div>
                      <div className="shrink-0">
                        {editing ? (
                          <input
                            type="checkbox"
                            checked={editForm.notifications.email}
                            onChange={(e) => handleInputChange('notifications', {
                              ...editForm.notifications,
                              email: e.target.checked
                            })}
                            className="h-4 w-4"
                          />
                        ) : (
                          <Badge variant={profile?.preferences?.notifications?.email ? 'default' : 'secondary'}>
                            {profile?.preferences?.notifications?.email ? 'Enabled' : 'Disabled'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <div className="shrink-0">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="grow">
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive updates via SMS</p>
                      </div>
                      <div className="shrink-0">
                        {editing ? (
                          <input
                            type="checkbox"
                            checked={editForm.notifications.sms}
                            onChange={(e) => handleInputChange('notifications', {
                              ...editForm.notifications,
                              sms: e.target.checked
                            })}
                            className="h-4 w-4"
                          />
                        ) : (
                          <Badge variant={profile?.preferences?.notifications?.sms ? 'default' : 'secondary'}>
                            {profile?.preferences?.notifications?.sms ? 'Enabled' : 'Disabled'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <div className="shrink-0">
                        <Smartphone className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="grow">
                        <h4 className="font-medium">Push Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive push notifications</p>
                      </div>
                      <div className="shrink-0">
                        {editing ? (
                          <input
                            type="checkbox"
                            checked={editForm.notifications.push}
                            onChange={(e) => handleInputChange('notifications', {
                              ...editForm.notifications,
                              push: e.target.checked
                            })}
                            className="h-4 w-4"
                          />
                        ) : (
                          <Badge variant={profile?.preferences?.notifications?.push ? 'default' : 'secondary'}>
                            {profile?.preferences?.notifications?.push ? 'Enabled' : 'Disabled'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Information */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
                <CardDescription>Current account status and last activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold text-green-600">Active</h4>
                    <p className="text-sm text-muted-foreground">Account Status</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold">{profile?.lastLogin ? new Date(profile.lastLogin).toLocaleDateString() : 'Never'}</h4>
                    <p className="text-sm text-muted-foreground">Last Login</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h4 className="font-semibold capitalize">{profile?.department || 'Unknown'}</h4>
                    <p className="text-sm text-muted-foreground">Department</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default ProfilePage