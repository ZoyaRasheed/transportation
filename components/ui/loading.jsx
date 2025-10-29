import { Card, CardContent } from '@/components/ui/card'
import { Truck, Loader2 } from 'lucide-react'

export function LoadingScreen({
  title = "Loading...",
  subtitle = "Please wait while we prepare your dashboard",
  variant = "default"
}) {
  if (variant === "redirect") {
    return (
      <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-background/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary/20 border-t-primary"></div>
              </div>
              <div className="flex items-center justify-center">
                <div className="bg-primary/10 rounded-full p-3 animate-pulse">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{subtitle}</p>

            <div className="mt-6 flex justify-center space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-brrom-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl border-0 bg-background/95 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-3 border-primary/20 border-t-primary"></div>
            </div>
            <div className="flex items-center justify-center">
              <div className="bg-linear-to-r from-primary/20 to-primary/10 rounded-full p-4 animate-pulse">
                <Truck className="h-8 w-8 text-primary" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground">{subtitle}</p>

            <div className="flex items-center justify-center space-x-2 mt-6">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-sm text-muted-foreground">Initializing system...</span>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-linear-to-rrom-primary to-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-linear-to-r from-primary to-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-linear-to-r from-primary to-primary/70 rounded-full animate-bounce"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function InlineLoader({ size = "default", text = "Loading..." }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div className="flex items-center justify-center space-x-2 py-4">
      <div className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary ${sizeClasses[size]}`}></div>
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  )
}