"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AuthGuard } from "@/components/auth-guard"
import { DoctorCard } from "@/components/doctor-card"
import { RehabilitationSection } from "@/components/rehabilitation-section"
import {
  User,
  Calendar,
  FileText,
  Pill,
  Heart,
  Phone,
  Mail,
  LogOut,
  Bell,
  Activity,
  Clock,
  AlertCircle,
  Play,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { AIExerciseSession } from "@/components/ai-exercise-session"
import type { Doctor } from "@/lib/doctor-assignment"

interface MedicalEntry {
  id: string
  date: string
  symptoms: string[]
  diagnosis: string
  doctor: string
  status: "completed" | "ongoing" | "follow-up"
}

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  prescribedBy: string
  prescribedDate: string
  status: "active" | "completed" | "discontinued"
}

const MOCK_MEDICAL_HISTORY: MedicalEntry[] = [
  {
    id: "1",
    date: "2024-01-15",
    symptoms: ["Headache", "Fatigue"],
    diagnosis: "Tension headache",
    doctor: "Dr. Sarah Johnson",
    status: "completed",
  },
  {
    id: "2",
    date: "2024-01-10",
    symptoms: ["Joint pain"],
    diagnosis: "Minor strain",
    doctor: "Dr. David Kim",
    status: "completed",
  },
]

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: "1",
    medication: "Ibuprofen",
    dosage: "400mg",
    frequency: "Twice daily",
    duration: "7 days",
    prescribedBy: "Dr. Sarah Johnson",
    prescribedDate: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    medication: "Multivitamin",
    dosage: "1 tablet",
    frequency: "Once daily",
    duration: "Ongoing",
    prescribedBy: "Dr. Sarah Johnson",
    prescribedDate: "2024-01-10",
    status: "active",
  },
]

export default function PatientDashboard() {
  const [assignedDoctor, setAssignedDoctor] = useState<Doctor | null>(null)
  const [healthSuggestions, setHealthSuggestions] = useState<string[]>([])
  const [medicalHistory, setMedicalHistory] = useState<MedicalEntry[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [progressData, setProgressData] = useState<any[]>([])
  const [showExerciseSession, setShowExerciseSession] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, logout } = useAuth()

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case "active":
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "follow-up":
        return "bg-yellow-100 text-yellow-800"
      case "discontinued":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    router.push("/")
  }, [logout, router])

  useEffect(() => {
    const loadPatientData = async () => {
      if (!user) {
        router.push('/patient/login')
        return
      }

      try {
        setIsLoading(true)
        
        // Load real progress data from API
        const progress = await apiClient.getMyProgress(30)
        setProgressData(progress)
        
        // Set mock data for now (replace with real API calls)
        setMedicalHistory(MOCK_MEDICAL_HISTORY)
        setPrescriptions(MOCK_PRESCRIPTIONS)
        setHealthSuggestions([
          "Complete your daily exercises",
          "Stay hydrated throughout the day",
          "Take breaks from sitting every hour"
        ])
      } catch (error) {
        console.error("Error loading patient data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPatientData()
  }, [user, router])

  const processedMedicalHistory = useMemo(() => {
    return medicalHistory.map((entry) => ({
      ...entry,
      formattedDate: new Date(entry.date).toLocaleDateString(),
      statusColor: getStatusColor(entry.status),
    }))
  }, [medicalHistory, getStatusColor])

  const processedPrescriptions = useMemo(() => {
    return prescriptions.map((prescription) => ({
      ...prescription,
      statusColor: getStatusColor(prescription.status),
    }))
  }, [prescriptions, getStatusColor])

  if (isLoading || !user) {
    return (
      <AuthGuard requiredUserType="patient">
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard requiredUserType="patient">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-primary">Physio</div>
                  <div className="text-2xl font-bold text-accent">Pulse</div>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <h1 className="text-xl font-semibold">Patient Dashboard</h1>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.full_name}
            </h2>
            <p className="text-muted-foreground">Here's an overview of your health information and care plan.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Assigned Doctor */}
              {assignedDoctor && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Your Assigned Doctor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DoctorCard doctor={assignedDoctor} />
                  </CardContent>
                </Card>
              )}

              {/* AI Exercise Session */}
              {showExerciseSession ? (
                <AIExerciseSession
                  exerciseType="shoulder_raise"
                  onComplete={(sessionData) => {
                    console.log('Session completed:', sessionData)
                    setShowExerciseSession(false)
                    // Refresh progress data
                    apiClient.getMyProgress(30).then(setProgressData)
                  }}
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Start AI Exercise Session</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => setShowExerciseSession(true)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Exercise with AI Feedback
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Comprehensive Rehabilitation Section */}
              <RehabilitationSection patientCondition={user?.symptoms?.[0] || "general"} />

              {/* Medical History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processedMedicalHistory.map((entry) => (
                      <div key={entry.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{entry.diagnosis}</h4>
                            <p className="text-sm text-muted-foreground">by {entry.doctor}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={entry.statusColor}>{entry.status}</Badge>
                            <p className="text-sm text-muted-foreground mt-1">{entry.formattedDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1">Symptoms:</p>
                          <div className="flex flex-wrap gap-1">
                            {entry.symptoms.map((symptom) => (
                              <Badge key={symptom} variant="outline" className="text-xs">
                                {symptom}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    {processedMedicalHistory.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No medical history available yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Prescriptions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5" />
                    Current Prescriptions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {processedPrescriptions.map((prescription) => (
                      <div key={prescription.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{prescription.medication}</h4>
                            <p className="text-sm text-muted-foreground">
                              {prescription.dosage} - {prescription.frequency}
                            </p>
                          </div>
                          <Badge className={prescription.statusColor}>{prescription.status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Duration:</p>
                            <p className="text-muted-foreground">{prescription.duration}</p>
                          </div>
                          <div>
                            <p className="font-medium">Prescribed by:</p>
                            <p className="text-muted-foreground">{prescription.prescribedBy}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {processedPrescriptions.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No active prescriptions.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Health Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Health Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm">{suggestion}</p>
                      </div>
                    ))}
                    {healthSuggestions.length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No health suggestions available.</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Doctor
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    Update Symptoms
                  </Button>
                  <Button className="w-full justify-start bg-transparent" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    View Lab Results
                  </Button>
                </CardContent>
              </Card>

              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Patient Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Role: {user.role}</span>
                  </div>
                  <Separator />
                  <div className="text-sm">
                    <p className="font-medium">Progress Sessions:</p>
                    <p className="text-muted-foreground">{progressData.length} completed</p>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span>Completed health assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <span>Assigned to {assignedDoctor?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                      <span>Account created</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
