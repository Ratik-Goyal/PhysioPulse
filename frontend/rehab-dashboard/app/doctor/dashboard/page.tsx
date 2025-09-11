"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthGuard } from "@/components/auth-guard"
import { Users, Calendar, FileText, Phone, Mail, LogOut, Bell, Plus, Search, Filter, Stethoscope } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  email: string
  phone: string
  lastVisit: string
  condition: string
  urgency: "low" | "medium" | "high" | "urgent"
  symptoms: string[]
  status: "new" | "ongoing" | "follow-up" | "discharged"
}

interface Recommendation {
  id: string
  patientId: string
  type: "prescription" | "advice" | "referral" | "follow-up"
  content: string
  date: string
  status: "pending" | "completed"
}

export default function DoctorDashboard() {
  const [doctorName, setDoctorName] = useState("")
  const [doctorSpecialty, setDoctorSpecialty] = useState("")
  const [patients, setPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [newRecommendation, setNewRecommendation] = useState({
    type: "advice" as const,
    content: "",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  useEffect(() => {
    // Load doctor data from localStorage
    const storedDoctorName = localStorage.getItem("doctorName")
    const storedDoctorSpecialty = localStorage.getItem("doctorSpecialty")

    if (storedDoctorName) setDoctorName(storedDoctorName)
    if (storedDoctorSpecialty) setDoctorSpecialty(storedDoctorSpecialty)

    // Mock patient data
    setPatients([
      {
        id: "1",
        name: "John Smith",
        age: 45,
        gender: "Male",
        email: "john.smith@email.com",
        phone: "(555) 123-4567",
        lastVisit: "2024-01-15",
        condition: "Chest pain evaluation",
        urgency: "high",
        symptoms: ["Chest pain", "Shortness of breath"],
        status: "new",
      },
      {
        id: "2",
        name: "Emily Johnson",
        age: 32,
        gender: "Female",
        email: "emily.johnson@email.com",
        phone: "(555) 234-5678",
        lastVisit: "2024-01-14",
        condition: "Migraine management",
        urgency: "medium",
        symptoms: ["Headache", "Nausea"],
        status: "ongoing",
      },
      {
        id: "3",
        name: "Michael Brown",
        age: 28,
        gender: "Male",
        email: "michael.brown@email.com",
        phone: "(555) 345-6789",
        lastVisit: "2024-01-13",
        condition: "Joint pain assessment",
        urgency: "low",
        symptoms: ["Joint pain", "Muscle pain"],
        status: "follow-up",
      },
      {
        id: "4",
        name: "Sarah Davis",
        age: 55,
        gender: "Female",
        email: "sarah.davis@email.com",
        phone: "(555) 456-7890",
        lastVisit: "2024-01-12",
        condition: "Routine checkup",
        urgency: "low",
        symptoms: ["Fatigue"],
        status: "ongoing",
      },
    ])

    // Mock recommendations
    setRecommendations([
      {
        id: "1",
        patientId: "1",
        type: "prescription",
        content: "Prescribed Aspirin 81mg daily for cardiovascular protection",
        date: "2024-01-15",
        status: "completed",
      },
      {
        id: "2",
        patientId: "2",
        type: "advice",
        content: "Recommend stress management techniques and regular sleep schedule",
        date: "2024-01-14",
        status: "pending",
      },
    ])
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    router.push("/")
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-yellow-100 text-yellow-800"
      case "follow-up":
        return "bg-purple-100 text-purple-800"
      case "discharged":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const handleAddRecommendation = () => {
    if (!selectedPatient || !newRecommendation.content.trim()) return

    const recommendation: Recommendation = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      type: newRecommendation.type,
      content: newRecommendation.content,
      date: new Date().toISOString().split("T")[0],
      status: "pending",
    }

    setRecommendations([...recommendations, recommendation])
    setNewRecommendation({ type: "advice", content: "" })
  }

  const patientRecommendations = recommendations.filter(
    (rec) => selectedPatient && rec.patientId === selectedPatient.id,
  )

  return (
    <AuthGuard requiredUserType="doctor">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-primary">Health</div>
                  <div className="text-2xl font-bold text-accent">Care</div>
                </Link>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="text-xl font-semibold">Doctor Dashboard</h1>
                  <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <div className="text-right">
                  <p className="font-medium">{doctorName}</p>
                  <p className="text-sm text-muted-foreground">{doctorSpecialty}</p>
                </div>
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
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Patient List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    My Patients ({filteredPatients.length})
                  </CardTitle>
                  <div className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search patients..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Patients</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="discharged">Discharged</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[600px] overflow-y-auto">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedPatient?.id === patient.id ? "bg-muted" : ""
                        }`}
                        onClick={() => setSelectedPatient(patient)}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-semibold">{patient.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {patient.age} years, {patient.gender}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Badge className={getUrgencyColor(patient.urgency)} size="sm">
                              {patient.urgency}
                            </Badge>
                            <Badge className={getStatusColor(patient.status)} size="sm">
                              {patient.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm font-medium mb-1">{patient.condition}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {patient.symptoms.slice(0, 2).map((symptom) => (
                            <Badge key={symptom} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                          {patient.symptoms.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{patient.symptoms.length - 2} more
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last visit: {new Date(patient.lastVisit).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Patient Details */}
            <div className="lg:col-span-2">
              {selectedPatient ? (
                <div className="space-y-6">
                  {/* Patient Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Stethoscope className="h-5 w-5" />
                        Patient Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-2xl font-bold">{selectedPatient.name}</h3>
                            <p className="text-muted-foreground">
                              {selectedPatient.age} years old, {selectedPatient.gender}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedPatient.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{selectedPatient.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Last visit: {new Date(selectedPatient.lastVisit).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold mb-2">Current Condition</h4>
                            <p className="text-sm">{selectedPatient.condition}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Symptoms</h4>
                            <div className="flex flex-wrap gap-1">
                              {selectedPatient.symptoms.map((symptom) => (
                                <Badge key={symptom} variant="outline">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getUrgencyColor(selectedPatient.urgency)}>
                              {selectedPatient.urgency} priority
                            </Badge>
                            <Badge className={getStatusColor(selectedPatient.status)}>{selectedPatient.status}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Add Recommendation */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Add Recommendation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                          <Label htmlFor="recommendationType">Type</Label>
                          <Select
                            value={newRecommendation.type}
                            onValueChange={(value: any) => setNewRecommendation({ ...newRecommendation, type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prescription">Prescription</SelectItem>
                              <SelectItem value="advice">Medical Advice</SelectItem>
                              <SelectItem value="referral">Referral</SelectItem>
                              <SelectItem value="follow-up">Follow-up</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <Label htmlFor="recommendationContent">Recommendation</Label>
                          <div className="flex gap-2">
                            <Textarea
                              id="recommendationContent"
                              placeholder="Enter your recommendation, prescription, or advice..."
                              value={newRecommendation.content}
                              onChange={(e) => setNewRecommendation({ ...newRecommendation, content: e.target.value })}
                              className="flex-1"
                            />
                            <Button onClick={handleAddRecommendation} disabled={!newRecommendation.content.trim()}>
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Patient Recommendations History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Recommendations & Treatment History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {patientRecommendations.map((recommendation) => (
                          <div key={recommendation.id} className="border border-border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{recommendation.type}</Badge>
                                <Badge
                                  className={
                                    recommendation.status === "completed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }
                                >
                                  {recommendation.status}
                                </Badge>
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {new Date(recommendation.date).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm">{recommendation.content}</p>
                          </div>
                        ))}
                        {patientRecommendations.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No recommendations yet. Add your first recommendation above.
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Select a Patient</h3>
                      <p className="text-muted-foreground">
                        Choose a patient from the list to view their details and manage their care.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
