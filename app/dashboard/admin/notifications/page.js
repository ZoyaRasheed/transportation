import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const NotificationCenter = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Notification Center</CardTitle>
                <CardDescription>Manage system notifications and alerts</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Bell className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-2xl">47</h3>
                  <p className="text-sm text-muted-foreground">Total Notifications</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-2xl">12</h3>
                  <p className="text-sm text-muted-foreground">Unread</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-2xl">3</h3>
                  <p className="text-sm text-muted-foreground">Urgent Alerts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-2xl">35</h3>
                  <p className="text-sm text-muted-foreground">Read</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Notifications</CardTitle>
                <CardDescription>Latest system notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Notification management interface will be implemented here with API integration.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default NotificationCenter