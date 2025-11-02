"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { assignDoctor, generateHealthSuggestions, type AssignmentCriteria } from "@/lib/doctor-assignment"

const symptoms = [
  "Fever",
  "Headache",
  "Cough",
  "Shortness of breath",
  "Chest pain",
  "Abdominal pain",
  "Nausea",
  "Vomiting",
  "Diarrhea",
  "Fatigue",
  "Dizziness",
  "Joint pain",
  "Muscle pain",
  "Skin rash",
  "Other",
]

const urgencyLevels = [
  { value: "low", label: "Low - Can wait a few days", color: "text-green-600" },
  { value: "medium", label: "Medium - Should be seen within 24-48 hours", color: "text-yellow-600" },
  { value: "high", label: "High - Need to be seen today", color: "text-orange-600" },
  { value: "urgent", label: "Urgent - Need immediate attention", color: "text-red-600" },
]

export default function HealthQuestionnaire() {
  const [currentStep, setCurrentStep] = useState(1)
  const [healthData, setHealthData] = useState({
    symptoms: [] as string[],
    painLevel: "",
    duration: "",
    urgency: "",
    description: "",
    medicalHistory: "",
    medications: "",
    allergies: "",
    previousTreatments: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleSymptomChange = (symptom: string, checked: boolean) => {
    setHealthData((prev) => ({
      ...prev,
      symptoms: checked ? [...prev.symptoms, symptom] : prev.symptoms.filter((s) => s !== symptom),
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setHealthData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      // Save health data to backend
      await apiClient.createPatientProfile({
        symptoms: healthData.symptoms,
        pain_level: healthData.painLevel,
        duration: healthData.duration,
        urgency: healthData.urgency,
        description: healthData.description,
        medical_history: healthData.medicalHistory,
        medications: healthData.medications,
        allergies: healthData.allergies,
        previous_treatments: healthData.previousTreatments
      })

      // Store health data locally for immediate use
      localStorage.setItem("healthData", JSON.stringify(healthData))

      const assignmentCriteria: AssignmentCriteria = {
        symptoms: healthData.symptoms,
        urgency: healthData.urgency,
        painLevel: healthData.painLevel,
        duration: healthData.duration,
      }

      const assignedDoctor = assignDoctor(assignmentCriteria)
      const healthSuggestions = generateHealthSuggestions(assignmentCriteria, assignedDoctor)

      // Store assignment results
      localStorage.setItem("assignedDoctor", JSON.stringify(assignedDoctor))
      localStorage.setItem("healthSuggestions", JSON.stringify(healthSuggestions))

      // Redirect to patient dashboard
      router.push("/patient/dashboard")
    } catch (error) {
      console.error('Failed to save health data:', error)
      // Still redirect to dashboard with local data
      router.push("/patient/dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">What symptoms are you experiencing?</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {symptoms.map((symptom) => (
                  <div key={symptom} className="flex items-center space-x-2">
                    <Checkbox
                      id={symptom}
                      checked={healthData.symptoms.includes(symptom)}
                      onCheckedChange={(checked) => handleSymptomChange(symptom, checked as boolean)}
                    />
                    <Label htmlFor={symptom} className="text-sm">
                      {symptom}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="painLevel" className="text-lg font-semibold">
                  Pain Level (0-10)
                </Label>
                <Select value={healthData.painLevel} onValueChange={(value) => handleInputChange("painLevel", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select pain level" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} - {i === 0 ? "No pain" : i <= 3 ? "Mild" : i <= 6 ? "Moderate" : "Severe"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration" className="text-lg font-semibold">
                  How long have you had these symptoms?
                </Label>
                <Select value={healthData.duration} onValueChange={(value) => handleInputChange("duration", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less-than-day">Less than a day</SelectItem>
                    <SelectItem value="1-3-days">1-3 days</SelectItem>
                    <SelectItem value="4-7-days">4-7 days</SelectItem>
                    <SelectItem value="1-2-weeks">1-2 weeks</SelectItem>
                    <SelectItem value="more-than-2-weeks">More than 2 weeks</SelectItem>
                    <SelectItem value="chronic">Chronic (ongoing)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="urgency" className="text-lg font-semibold">
                  How urgent is your condition?
                </Label>
                <Select value={healthData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select urgency level" />
                  </SelectTrigger>
                  <SelectContent>
                    {urgencyLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <span className={level.color}>{level.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="description" className="text-lg font-semibold">
                Describe your symptoms in detail
              </Label>
              <Textarea
                id="description"
                placeholder="Please provide a detailed description of your symptoms, when they started, what makes them better or worse, etc."
                value={healthData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-2 min-h-[120px]"
              />
            </div>

            <div>
              <Label htmlFor="previousTreatments" className="text-lg font-semibold">
                Any treatments you've tried?
              </Label>
              <Textarea
                id="previousTreatments"
                placeholder="List any medications, home remedies, or treatments you've already tried"
                value={healthData.previousTreatments}
                onChange={(e) => handleInputChange("previousTreatments", e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="medicalHistory" className="text-lg font-semibold">
                Medical History
              </Label>
              <Textarea
                id="medicalHistory"
                placeholder="List any chronic conditions, past surgeries, or significant medical history"
                value={healthData.medicalHistory}
                onChange={(e) => handleInputChange("medicalHistory", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="medications" className="text-lg font-semibold">
                Current Medications
              </Label>
              <Textarea
                id="medications"
                placeholder="List all medications you're currently taking, including dosages"
                value={healthData.medications}
                onChange={(e) => handleInputChange("medications", e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="allergies" className="text-lg font-semibold">
                Allergies
              </Label>
              <Textarea
                id="allergies"
                placeholder="List any known allergies to medications, foods, or other substances"
                value={healthData.allergies}
                onChange={(e) => handleInputChange("allergies", e.target.value)}
                className="mt-2"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AuthGuard requiredUserType="patient">
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-6 max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Health Assessment</CardTitle>
              <p className="text-muted-foreground">
                Help us understand your condition to match you with the right healthcare professional
              </p>
              <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full ${step <= currentStep ? "bg-primary" : "bg-muted"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Step {currentStep} of 4</p>
            </CardHeader>
            <CardContent>
              {renderStep()}

              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 1}>
                  Previous
                </Button>

                {currentStep < 4 ? (
                  <Button onClick={handleNext}>Next</Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={isLoading}>
                    {isLoading ? "Processing..." : "Complete Assessment"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  )
}
