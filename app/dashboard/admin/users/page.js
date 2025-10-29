import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, UserPlus, Shield, UserCheck } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const UserManagement = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">User Management</CardTitle>
                <CardDescription>Manage system users, roles, and permissions</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-2xl">45</h3>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <UserCheck className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-2xl">42</h3>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-2xl">5</h3>
                  <p className="text-sm text-muted-foreground">Admin Users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <UserPlus className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-2xl">3</h3>
                  <p className="text-sm text-muted-foreground">New This Week</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>User List</CardTitle>
                <CardDescription>View and manage all system users</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">User management interface will be implemented here with API integration.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default UserManagement