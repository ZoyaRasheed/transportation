import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

const AllRequests = () => {
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 rounded-full p-2">
                <ClipboardList className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">All Requests</CardTitle>
                <CardDescription>Monitor all truck requests across the system</CardDescription>
              </div>
              <Badge variant="destructive" className="ml-auto">Admin Access</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <ClipboardList className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <h3 className="font-semibold text-2xl">23</h3>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                  <h3 className="font-semibold text-2xl">8</h3>
                  <p className="text-sm text-muted-foreground">Pending</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <h3 className="font-semibold text-2xl">5</h3>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <h3 className="font-semibold text-2xl">10</h3>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Request History</CardTitle>
                <CardDescription>Complete overview of all truck requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Request management interface will be implemented here with API integration.</p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default AllRequests