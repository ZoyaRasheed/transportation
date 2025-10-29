import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Truck, Clock } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const LoaderDashboard = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Loader Dashboard</CardTitle>
                <CardDescription>Loading Department - Manage loads and request trucks</CardDescription>
              </div>
              <Badge variant="secondary" className="ml-auto">Loading Dept</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Package className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-2xl">12</h3>
                  <p className="text-sm text-muted-foreground">Pending Loads</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-2xl">3</h3>
                  <p className="text-sm text-muted-foreground">Trucks Requested</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-2xl">15m</h3>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" size="lg">Request Truck</Button>
                <Button variant="outline" className="w-full" size="lg">Mark Load Ready</Button>
                <Button variant="secondary" className="w-full" size="lg">View Load Status</Button>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default LoaderDashboard