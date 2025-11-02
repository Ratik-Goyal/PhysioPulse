import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ConnectionStatus } from "@/components/connection-status"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-4xl font-bold text-primary">Physio</div>
            <div className="text-4xl font-bold text-accent">Pulse</div>
          </div>
          <div className="mb-4">
            <ConnectionStatus />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced patient management system connecting patients with healthcare professionals through intelligent
            matching and comprehensive care coordination
          </p>
        </div>

        {/* Login Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Patient Login */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-primary">Patient Portal</CardTitle>
              <p className="text-muted-foreground">
                Access your medical records, view prescriptions, and connect with your healthcare team
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/patient/login" className="block">
                <Button className="w-full" size="lg">
                  Patient Login
                </Button>
              </Link>
              <Link href="/patient/register" className="block">
                <Button variant="outline" className="w-full bg-transparent" size="lg">
                  New Patient Registration
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Doctor Login */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-accent">Doctor Portal</CardTitle>
              <p className="text-muted-foreground">
                Manage your patients, review medical histories, and provide care recommendations
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/doctor/login" className="block">
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
                  Doctor Login
                </Button>
              </Link>
              <div className="text-center text-sm text-muted-foreground">Contact admin for doctor account setup</div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-primary rounded"></div>
            </div>
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-muted-foreground">
              Your medical data is protected with industry-standard security
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-accent rounded"></div>
            </div>
            <h3 className="font-semibold mb-2">Smart Matching</h3>
            <p className="text-sm text-muted-foreground">
              Automatically matched with the right healthcare professional
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-primary rounded"></div>
            </div>
            <h3 className="font-semibold mb-2">24/7 Access</h3>
            <p className="text-sm text-muted-foreground">Access your health information anytime, anywhere</p>
          </div>
        </div>
      </div>
    </div>
  )
}
