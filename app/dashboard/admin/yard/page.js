import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Building2, Truck, MapPin, Activity } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const YardOperations = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Yard Operations</CardTitle>
                <CardDescription>Monitor loading bays, truck movements, and yard status</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <Building2 className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-2xl">12</h3>
                  <p className="text-sm text-muted-foreground">Total Bays</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-2xl">8</h3>
                  <p className="text-sm text-muted-foreground">Active Bays</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Truck className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-2xl">15</h3>
                  <p className="text-sm text-muted-foreground">Trucks in Yard</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <h3 className="font-semibold text-2xl">34</h3>
                  <p className="text-sm text-muted-foreground">Total Movements</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Loading Bays Status</CardTitle>
                  <CardDescription>Real-time bay availability</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Loading bay management interface will be implemented here with API integration.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Yard Movements</CardTitle>
                  <CardDescription>Track truck movements in real-time</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Movement tracking interface will be implemented here with API integration.</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default YardOperations