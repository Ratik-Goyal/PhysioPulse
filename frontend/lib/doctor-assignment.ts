export interface Doctor {
  id: string
  name: string
  specialty: string
  subSpecialties: string[]
  availability: "available" | "busy" | "unavailable"
  rating: number
  experience: number
  languages: string[]
  location: string
  emergencyCapable: boolean
}

export interface AssignmentCriteria {
  symptoms: string[]
  urgency: string
  painLevel: string
  duration: string
  patientAge?: number
  preferredLanguage?: string
  location?: string
}

// Mock doctor database
export const doctorDatabase: Doctor[] = [
  {
    id: "dr-001",
    name: "Dr. Sarah Johnson",
    specialty: "General Medicine",
    subSpecialties: ["Preventive Care", "Internal Medicine"],
    availability: "available",
    rating: 4.8,
    experience: 12,
    languages: ["English", "Spanish"],
    location: "Downtown Medical Center",
    emergencyCapable: true,
  },
  {
    id: "dr-002",
    name: "Dr. Michael Chen",
    specialty: "Emergency Medicine",
    subSpecialties: ["Trauma Care", "Critical Care"],
    availability: "available",
    rating: 4.9,
    experience: 15,
    languages: ["English", "Mandarin"],
    location: "Emergency Department",
    emergencyCapable: true,
  },
  {
    id: "dr-003",
    name: "Dr. Emily Rodriguez",
    specialty: "Cardiology",
    subSpecialties: ["Interventional Cardiology", "Heart Failure"],
    availability: "available",
    rating: 4.7,
    experience: 18,
    languages: ["English", "Spanish"],
    location: "Cardiac Center",
    emergencyCapable: false,
  },
  {
    id: "dr-004",
    name: "Dr. David Kim",
    specialty: "Orthopedics",
    subSpecialties: ["Sports Medicine", "Joint Replacement"],
    availability: "available",
    rating: 4.6,
    experience: 10,
    languages: ["English", "Korean"],
    location: "Orthopedic Clinic",
    emergencyCapable: false,
  },
  {
    id: "dr-005",
    name: "Dr. Lisa Thompson",
    specialty: "Dermatology",
    subSpecialties: ["Medical Dermatology", "Cosmetic Dermatology"],
    availability: "available",
    rating: 4.8,
    experience: 8,
    languages: ["English"],
    location: "Dermatology Center",
    emergencyCapable: false,
  },
  {
    id: "dr-006",
    name: "Dr. James Wilson",
    specialty: "Gastroenterology",
    subSpecialties: ["Inflammatory Bowel Disease", "Liver Disease"],
    availability: "available",
    rating: 4.7,
    experience: 14,
    languages: ["English"],
    location: "GI Clinic",
    emergencyCapable: false,
  },
  {
    id: "dr-007",
    name: "Dr. Maria Garcia",
    specialty: "Neurology",
    subSpecialties: ["Headache Medicine", "Epilepsy"],
    availability: "available",
    rating: 4.9,
    experience: 16,
    languages: ["English", "Spanish"],
    location: "Neurology Center",
    emergencyCapable: false,
  },
  {
    id: "dr-008",
    name: "Dr. Robert Brown",
    specialty: "Pulmonology",
    subSpecialties: ["Asthma", "Sleep Medicine"],
    availability: "busy",
    rating: 4.6,
    experience: 11,
    languages: ["English"],
    location: "Pulmonary Clinic",
    emergencyCapable: false,
  },
]

// Symptom to specialty mapping
const symptomSpecialtyMap: Record<string, string[]> = {
  "Chest pain": ["Cardiology", "Emergency Medicine"],
  "Shortness of breath": ["Pulmonology", "Cardiology", "Emergency Medicine"],
  Headache: ["Neurology", "General Medicine"],
  "Joint pain": ["Orthopedics", "Rheumatology"],
  "Muscle pain": ["Orthopedics", "General Medicine"],
  "Skin rash": ["Dermatology", "General Medicine"],
  "Abdominal pain": ["Gastroenterology", "General Medicine", "Emergency Medicine"],
  Nausea: ["Gastroenterology", "General Medicine"],
  Vomiting: ["Gastroenterology", "General Medicine", "Emergency Medicine"],
  Diarrhea: ["Gastroenterology", "General Medicine"],
  Fever: ["General Medicine", "Emergency Medicine"],
  Cough: ["Pulmonology", "General Medicine"],
  Dizziness: ["Neurology", "Cardiology", "General Medicine"],
  Fatigue: ["General Medicine"],
}

export function assignDoctor(criteria: AssignmentCriteria): Doctor {
  // Step 1: Handle urgent cases
  if (criteria.urgency === "urgent") {
    const emergencyDoctors = doctorDatabase.filter(
      (doctor) => doctor.emergencyCapable && doctor.availability === "available",
    )
    if (emergencyDoctors.length > 0) {
      return emergencyDoctors.sort((a, b) => b.rating - a.rating)[0]
    }
  }

  // Step 2: Find specialists based on symptoms
  const relevantSpecialties = new Set<string>()

  criteria.symptoms.forEach((symptom) => {
    const specialties = symptomSpecialtyMap[symptom] || ["General Medicine"]
    specialties.forEach((specialty) => relevantSpecialties.add(specialty))
  })

  // Step 3: Filter doctors by specialty and availability
  let candidateDoctors = doctorDatabase.filter((doctor) => {
    return relevantSpecialties.has(doctor.specialty) && doctor.availability === "available"
  })

  // Step 4: If no specialists available, fall back to general medicine
  if (candidateDoctors.length === 0) {
    candidateDoctors = doctorDatabase.filter(
      (doctor) => doctor.specialty === "General Medicine" && doctor.availability === "available",
    )
  }

  // Step 5: Score and rank doctors
  const scoredDoctors = candidateDoctors.map((doctor) => {
    let score = 0

    // Base score from rating and experience
    score += doctor.rating * 20
    score += Math.min(doctor.experience, 20) * 2

    // Bonus for emergency capability in high urgency cases
    if ((criteria.urgency === "high" || criteria.urgency === "urgent") && doctor.emergencyCapable) {
      score += 15
    }

    // Bonus for exact specialty match
    if (relevantSpecialties.has(doctor.specialty)) {
      score += 25
    }

    // Bonus for subspecialty match
    const hasSubspecialtyMatch = doctor.subSpecialties.some((sub) =>
      criteria.symptoms.some((symptom) => sub.toLowerCase().includes(symptom.toLowerCase())),
    )
    if (hasSubspecialtyMatch) {
      score += 10
    }

    return { doctor, score }
  })

  // Step 6: Return the highest scored doctor
  scoredDoctors.sort((a, b) => b.score - a.score)

  return scoredDoctors.length > 0
    ? scoredDoctors[0].doctor
    : doctorDatabase.find((d) => d.specialty === "General Medicine" && d.availability === "available") ||
        doctorDatabase[0]
}

export function getDoctorsBySpecialty(specialty: string): Doctor[] {
  return doctorDatabase.filter((doctor) => doctor.specialty === specialty)
}

export function getAllSpecialties(): string[] {
  return Array.from(new Set(doctorDatabase.map((doctor) => doctor.specialty)))
}

export function updateDoctorAvailability(doctorId: string, availability: Doctor["availability"]): void {
  const doctor = doctorDatabase.find((d) => d.id === doctorId)
  if (doctor) {
    doctor.availability = availability
  }
}

// Generate health suggestions based on symptoms and assignment
export function generateHealthSuggestions(criteria: AssignmentCriteria, assignedDoctor: Doctor): string[] {
  const suggestions: string[] = []

  // Urgency-based suggestions
  if (criteria.urgency === "urgent" || criteria.urgency === "high") {
    suggestions.push("Seek immediate medical attention. Do not delay treatment.")
    suggestions.push("If symptoms worsen, go to the nearest emergency room.")
  }

  // Symptom-specific suggestions
  if (criteria.symptoms.includes("Chest pain")) {
    suggestions.push("Avoid strenuous activities until evaluated by a healthcare provider.")
    suggestions.push("If chest pain is severe or accompanied by shortness of breath, call 911.")
  }

  if (criteria.symptoms.includes("Fever")) {
    suggestions.push("Stay hydrated and get plenty of rest.")
    suggestions.push("Monitor your temperature regularly.")
  }

  if (criteria.symptoms.includes("Joint pain") || criteria.symptoms.includes("Muscle pain")) {
    suggestions.push("Apply ice to reduce swelling and inflammation.")
    suggestions.push("Avoid activities that worsen the pain.")
  }

  if (criteria.symptoms.includes("Headache")) {
    suggestions.push("Stay in a quiet, dark room if possible.")
    suggestions.push("Stay hydrated and avoid known triggers.")
  }

  // General suggestions
  suggestions.push(`You've been matched with ${assignedDoctor.name}, a ${assignedDoctor.specialty} specialist.`)
  suggestions.push("Keep a symptom diary to track changes in your condition.")
  suggestions.push("Prepare a list of questions for your appointment.")

  return suggestions
}
