'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus, Truck, MapPin, Package, Clock, AlertCircle, Calendar,
  Weight, FileText, Zap, CheckCircle2, ArrowRight, Loader2
} from 'lucide-react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { toast } from 'sonner'
import axios from 'axios'

const CreateRequestPage = () => {
  const { data: session } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const [formData, setFormData] = useState({
    loadDescription: '',
    priority: 'normal',
    pickupLocation: '',
    destination: '',
    estimatedWeight: '',
    requiredBy: '',
    specialInstructions: '',
    urgentDelivery: false,
    fragileItems: false,
    heavyLift: false,
    temperatureControl: false,
    contactPerson: '',
    contactPhone: ''
  })

  const [errors, setErrors] = useState({})

  const validateStep = (step) => {
    const newErrors = {}

    if (step === 1) {
      if (!formData.loadDescription.trim()) {
        newErrors.loadDescription = 'Load description is required'
      }
      if (!formData.pickupLocation.trim()) {
        newErrors.pickupLocation = 'Pickup location is required'
      }
      if (!formData.destination.trim()) {
        newErrors.destination = 'Destination is required'
      }
    }

    if (step === 2) {
      if (formData.estimatedWeight && isNaN(formData.estimatedWeight)) {
        newErrors.estimatedWeight = 'Weight must be a number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => prev - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return

    try {
      setIsSubmitting(true)

      // Generate a unique load ID
      const loadId = `LD${Date.now()}`

      // Map form data to API expected fields
      const requestData = {
        loadId,
        loadDescription: formData.loadDescription,
        priority: formData.priority,
        pickupLocation: formData.pickupLocation,
        deliveryLocation: formData.destination, // Map destination to deliveryLocation
        estimatedWeight: formData.estimatedWeight ? Number(formData.estimatedWeight) : undefined,
        requiredTime: formData.requiredBy || undefined, // Map requiredBy to requiredTime
        notes: formData.specialInstructions || undefined // Map specialInstructions to notes
      }

      const response = await axios.post('/api/truck-requests', requestData)

      if (response.data.success) {
        toast.success('🚚 Truck request created successfully!')
        router.push('/dashboard/loader/requests')
      }
    } catch (error) {
      console.error('Request creation error:', error)
      toast.error(error.response?.data?.message || 'Failed to create truck request')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return <Zap className="h-4 w-4 text-destructive" />
      case 'high': return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'normal': return <Clock className="h-4 w-4 text-secondary-foreground" />
      case 'low': return <CheckCircle2 className="h-4 w-4 text-primary" />
      default: return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'from-destructive/10 to-destructive/20 border-destructive/30',
      high: 'from-destructive/5 to-destructive/10 border-destructive/20',
      normal: 'from-secondary/5 to-secondary/10 border-secondary/20',
      low: 'from-primary/5 to-primary/10 border-primary/20'
    }
    return colors[priority] || 'from-muted/5 to-muted/10 border-border'
  }

  return (
    <DashboardLayout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="bg-linear-to-r from-primary via-primary/90 to-primary/80 rounded-2xl p-6 text-primary-foreground">
          <div className="flex items-center space-x-4">
            <div className="bg-primary-foreground/20 backdrop-blur-sm rounded-xl p-3">
              <Plus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Create New Request</h1>
              <p className="text-primary-foreground/80">Submit a new transportation request with all the details</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                    ${currentStep >= step
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                    }
                  `}>
                    {currentStep > step ? <CheckCircle2 className="h-5 w-5" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`
                      h-1 w-20 mx-2
                      ${currentStep > step ? 'bg-primary' : 'bg-muted'}
                    `} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Basic Information</span>
              <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Additional Details</span>
              <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>Review & Submit</span>
            </div>
          </CardContent>
        </Card>

        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-primary" />
                <span>Basic Information</span>
              </CardTitle>
              <CardDescription>Provide the essential details about your transportation request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="loadDescription" className="text-sm font-medium">
                  Load Description *
                </Label>
                <Textarea
                  id="loadDescription"
                  placeholder="Describe what needs to be transported (e.g., Raw materials, finished goods, equipment...)"
                  value={formData.loadDescription}
                  onChange={(e) => handleInputChange('loadDescription', e.target.value)}
                  className={`min-h-20 ${errors.loadDescription ? 'border-destructive' : ''}`}
                />
                {errors.loadDescription && (
                  <p className="text-destructive text-sm">{errors.loadDescription}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="pickupLocation" className="text-sm font-medium">
                    Pickup Location *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="pickupLocation"
                      placeholder="Enter pickup address or location"
                      value={formData.pickupLocation}
                      onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                      className={`pl-10 ${errors.pickupLocation ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.pickupLocation && (
                    <p className="text-destructive text-sm">{errors.pickupLocation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination" className="text-sm font-medium">
                    Destination *
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="destination"
                      placeholder="Enter delivery address or location"
                      value={formData.destination}
                      onChange={(e) => handleInputChange('destination', e.target.value)}
                      className={`pl-10 ${errors.destination ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.destination && (
                    <p className="text-destructive text-sm">{errors.destination}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Priority Level</Label>
                <RadioGroup
                  value={formData.priority}
                  onValueChange={(value) => handleInputChange('priority', value)}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                >
                  {['low', 'normal', 'high', 'urgent'].map((priority) => (
                    <div key={priority} className={`
                      border-2 rounded-lg p-4 cursor-pointer transition-all
                      bg-linear-to-br ${getPriorityColor(priority)}
                      ${formData.priority === priority ? 'ring-2 ring-primary' : ''}
                    `}>
                      <RadioGroupItem value={priority} id={priority} className="sr-only" />
                      <Label htmlFor={priority} className="cursor-pointer">
                        <div className="flex items-center space-x-3">
                          {getPriorityIcon(priority)}
                          <div>
                            <h4 className="font-medium capitalize">{priority} Priority</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {priority === 'low' && 'Flexible delivery schedule'}
                              {priority === 'normal' && 'Standard processing time'}
                              {priority === 'high' && 'Expedited delivery'}
                              {priority === 'urgent' && 'Immediate attention required'}
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Additional Details */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Additional Details</span>
              </CardTitle>
              <CardDescription>Provide more specific information about your shipment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="estimatedWeight" className="text-sm font-medium">
                    Estimated Weight (kg)
                  </Label>
                  <div className="relative">
                    <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="estimatedWeight"
                      type="number"
                      placeholder="Enter weight in kilograms"
                      value={formData.estimatedWeight}
                      onChange={(e) => handleInputChange('estimatedWeight', e.target.value)}
                      className={`pl-10 ${errors.estimatedWeight ? 'border-destructive' : ''}`}
                    />
                  </div>
                  {errors.estimatedWeight && (
                    <p className="text-destructive text-sm">{errors.estimatedWeight}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requiredBy" className="text-sm font-medium">
                    Required By
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="requiredBy"
                      type="datetime-local"
                      value={formData.requiredBy}
                      onChange={(e) => handleInputChange('requiredBy', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-sm font-medium">
                    Contact Person
                  </Label>
                  <Input
                    id="contactPerson"
                    placeholder="Name of contact person"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone" className="text-sm font-medium">
                    Contact Phone
                  </Label>
                  <Input
                    id="contactPhone"
                    placeholder="Phone number for coordination"
                    value={formData.contactPhone}
                    onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Special Requirements</Label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'urgentDelivery', label: 'Urgent Delivery', icon: Zap },
                    { id: 'fragileItems', label: 'Fragile Items', icon: AlertCircle },
                    { id: 'heavyLift', label: 'Heavy Lifting Required', icon: Weight },
                    { id: 'temperatureControl', label: 'Temperature Control', icon: Package }
                  ].map(({ id, label, icon: Icon }) => (
                    <div key={id} className="flex items-center space-x-2 p-3 border rounded-lg">
                      <Checkbox
                        id={id}
                        checked={formData[id]}
                        onCheckedChange={(checked) => handleInputChange(id, checked)}
                      />
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <Label htmlFor={id} className="text-sm">{label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions" className="text-sm font-medium">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any special handling requirements, delivery notes, access instructions..."
                  value={formData.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className="min-h-20"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {currentStep === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>Review & Submit</span>
              </CardTitle>
              <CardDescription>Please review your request details before submitting</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                <div>
                  <h4 className="font-medium text-foreground">Load Description</h4>
                  <p className="text-muted-foreground mt-1">{formData.loadDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">Pickup Location</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-primary" />
                      <p className="text-muted-foreground">{formData.pickupLocation}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">Destination</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-destructive" />
                      <p className="text-muted-foreground">{formData.destination}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-foreground">Priority</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {getPriorityIcon(formData.priority)}
                      <Badge variant={formData.priority === 'high' ? 'destructive' : 'default'} className="capitalize">
                        {formData.priority}
                      </Badge>
                    </div>
                  </div>
                  {formData.estimatedWeight && (
                    <div>
                      <h4 className="font-medium text-foreground">Weight</h4>
                      <p className="text-muted-foreground mt-1">{formData.estimatedWeight} kg</p>
                    </div>
                  )}
                  {formData.requiredBy && (
                    <div>
                      <h4 className="font-medium text-foreground">Required By</h4>
                      <p className="text-muted-foreground mt-1">
                        {new Date(formData.requiredBy).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>

                {formData.specialInstructions && (
                  <div>
                    <h4 className="font-medium text-foreground">Special Instructions</h4>
                    <p className="text-muted-foreground mt-1">{formData.specialInstructions}</p>
                  </div>
                )}

                {(formData.urgentDelivery || formData.fragileItems || formData.heavyLift || formData.temperatureControl) && (
                  <div>
                    <h4 className="font-medium text-foreground">Special Requirements</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.urgentDelivery && <Badge variant="outline">Urgent Delivery</Badge>}
                      {formData.fragileItems && <Badge variant="outline">Fragile Items</Badge>}
                      {formData.heavyLift && <Badge variant="outline">Heavy Lifting</Badge>}
                      {formData.temperatureControl && <Badge variant="outline">Temperature Control</Badge>}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="min-w-[120px]"
              >
                Back
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-primary hover:bg-primary/90 min-w-[120px]"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 min-w-[120px]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Truck className="h-4 w-4 mr-2" />
                      Submit Request
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default CreateRequestPage