import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Clock, Phone, Calendar } from "lucide-react"
import type { Doctor } from "@/lib/doctor-assignment"

interface DoctorCardProps {
  doctor: Doctor
  showActions?: boolean
}

export function DoctorCard({ doctor, showActions = true }: DoctorCardProps) {
  const getAvailabilityColor = (availability: Doctor["availability"]) => {
    switch (availability) {
      case "available":
        return "bg-green-100 text-green-800"
      case "busy":
        return "bg-yellow-100 text-yellow-800"
      case "unavailable":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{doctor.name}</CardTitle>
            <p className="text-lg text-primary font-semibold">{doctor.specialty}</p>
          </div>
          <Badge className={getAvailabilityColor(doctor.availability)}>{doctor.availability}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>{doctor.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{doctor.experience} years</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span>{doctor.location}</span>
        </div>

        {doctor.subSpecialties.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Specializations:</p>
            <div className="flex flex-wrap gap-1">
              {doctor.subSpecialties.map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="text-sm font-medium mb-1">Languages:</p>
          <p className="text-sm text-muted-foreground">{doctor.languages.join(", ")}</p>
        </div>

        {showActions && (
          <div className="flex gap-2 pt-4">
            <Button className="flex-1" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Contact
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
