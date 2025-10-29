import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, BarChart3, PieChart, LineChart } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const AnalyticsReports = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Analytics & Reports</CardTitle>
                <CardDescription>System performance metrics and operational insights</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-2xl">89%</h3>
                  <p className="text-sm text-muted-foreground">System Efficiency</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <LineChart className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-2xl">156</h3>
                  <p className="text-sm text-muted-foreground">Requests Today</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-2xl">23m</h3>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-2xl">+12%</h3>
                  <p className="text-sm text-muted-foreground">Performance Growth</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Performance charts and metrics will be implemented here with API integration.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Reports</CardTitle>
                  <CardDescription>System usage and activity reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Usage analytics and reports will be implemented here with API integration.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AnalyticsReports