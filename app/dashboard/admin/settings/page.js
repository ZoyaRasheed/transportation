import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Database, Shield, Bell } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const SystemSettings = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">System Settings</CardTitle>
                <CardDescription>Configure system parameters and preferences</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-blue-600" />
                    <CardTitle className="text-lg">Database Configuration</CardTitle>
                  </div>
                  <CardDescription>Manage database connections and settings</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Database configuration interface will be implemented here.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-600" />
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                  </div>
                  <CardDescription>Configure authentication and security policies</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Security configuration interface will be implemented here.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-lg">Notification Settings</CardTitle>
                  </div>
                  <CardDescription>Configure system notifications and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Notification configuration interface will be implemented here.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <CardTitle className="text-lg">General Settings</CardTitle>
                  </div>
                  <CardDescription>System-wide configuration options</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">General system settings interface will be implemented here.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default SystemSettings