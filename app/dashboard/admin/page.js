import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Users, Shield } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const AdminDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                <CardDescription>User Management & System Administration</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold">User Management</h3>
                  <p className="text-sm text-muted-foreground">Manage system users</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold">System Settings</h3>
                  <p className="text-sm text-muted-foreground">Configure system</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold">Security</h3>
                  <p className="text-sm text-muted-foreground">Security management</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AdminDashboard