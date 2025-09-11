export interface HealthSuggestion {
  id: string
  type: "immediate" | "lifestyle" | "preventive" | "medication" | "follow-up" | "emergency"
  priority: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  category: string
  actionable: boolean
  timeframe?: string
}

export interface PatientProfile {
  age: number
  gender: string
  symptoms: string[]
  urgency: string
  painLevel: string
  duration: string
  medicalHistory?: string[]
  medications?: string[]
  allergies?: string[]
  lifestyle?: {
    smoking?: boolean
    alcohol?: boolean
    exercise?: string
    diet?: string
  }
}

// Comprehensive health suggestion database
const suggestionDatabase: Record<string, HealthSuggestion[]> = {
  "Chest pain": [
    {
      id: "chest-1",
      type: "emergency",
      priority: "critical",
      title: "Seek Immediate Medical Attention",
      description:
        "Chest pain can be a sign of a heart attack or other serious condition. Do not drive yourself to the hospital.",
      category: "Emergency Care",
      actionable: true,
      timeframe: "Immediately",
    },
    {
      id: "chest-2",
      type: "immediate",
      priority: "high",
      title: "Avoid Physical Exertion",
      description: "Rest and avoid any strenuous activities until evaluated by a healthcare provider.",
      category: "Activity Restriction",
      actionable: true,
      timeframe: "Until medical evaluation",
    },
    {
      id: "chest-3",
      type: "lifestyle",
      priority: "medium",
      title: "Monitor Symptoms",
      description: "Keep track of when chest pain occurs, its intensity, and any triggers.",
      category: "Self-Monitoring",
      actionable: true,
      timeframe: "Ongoing",
    },
  ],
  Headache: [
    {
      id: "head-1",
      type: "immediate",
      priority: "medium",
      title: "Rest in Dark, Quiet Environment",
      description: "Reduce light and noise exposure to help alleviate headache symptoms.",
      category: "Symptom Management",
      actionable: true,
      timeframe: "During episodes",
    },
    {
      id: "head-2",
      type: "lifestyle",
      priority: "medium",
      title: "Stay Hydrated",
      description: "Drink plenty of water as dehydration can trigger or worsen headaches.",
      category: "Hydration",
      actionable: true,
      timeframe: "Daily",
    },
    {
      id: "head-3",
      type: "preventive",
      priority: "low",
      title: "Identify Triggers",
      description: "Keep a headache diary to identify potential triggers like foods, stress, or sleep patterns.",
      category: "Prevention",
      actionable: true,
      timeframe: "2-4 weeks",
    },
  ],
  Fever: [
    {
      id: "fever-1",
      type: "immediate",
      priority: "medium",
      title: "Monitor Temperature Regularly",
      description: "Check your temperature every 4-6 hours and seek medical attention if it exceeds 103°F (39.4°C).",
      category: "Monitoring",
      actionable: true,
      timeframe: "Every 4-6 hours",
    },
    {
      id: "fever-2",
      type: "lifestyle",
      priority: "medium",
      title: "Increase Fluid Intake",
      description:
        "Drink plenty of fluids to prevent dehydration. Water, herbal teas, and clear broths are recommended.",
      category: "Hydration",
      actionable: true,
      timeframe: "Throughout illness",
    },
    {
      id: "fever-3",
      type: "immediate",
      priority: "medium",
      title: "Get Adequate Rest",
      description:
        "Allow your body to fight the infection by getting plenty of sleep and avoiding strenuous activities.",
      category: "Rest",
      actionable: true,
      timeframe: "Until fever subsides",
    },
  ],
  "Joint pain": [
    {
      id: "joint-1",
      type: "immediate",
      priority: "medium",
      title: "Apply Ice or Heat",
      description:
        "Use ice for acute injuries (first 48 hours) or heat for chronic pain to reduce inflammation and discomfort.",
      category: "Pain Management",
      actionable: true,
      timeframe: "15-20 minutes, 3-4 times daily",
    },
    {
      id: "joint-2",
      type: "lifestyle",
      priority: "medium",
      title: "Gentle Movement and Stretching",
      description:
        "Maintain joint mobility with gentle exercises and stretching, but avoid activities that worsen pain.",
      category: "Exercise",
      actionable: true,
      timeframe: "Daily",
    },
    {
      id: "joint-3",
      type: "preventive",
      priority: "low",
      title: "Maintain Healthy Weight",
      description: "Excess weight puts additional stress on joints. Consider a balanced diet and regular exercise.",
      category: "Weight Management",
      actionable: true,
      timeframe: "Long-term",
    },
  ],
}

// General preventive care suggestions
const preventiveCare: HealthSuggestion[] = [
  {
    id: "prev-1",
    type: "preventive",
    priority: "medium",
    title: "Regular Health Screenings",
    description: "Schedule annual check-ups and age-appropriate screenings for early detection of health issues.",
    category: "Preventive Care",
    actionable: true,
    timeframe: "Annually",
  },
  {
    id: "prev-2",
    type: "lifestyle",
    priority: "medium",
    title: "Maintain Regular Exercise",
    description: "Aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity weekly.",
    category: "Physical Activity",
    actionable: true,
    timeframe: "Weekly",
  },
  {
    id: "prev-3",
    type: "lifestyle",
    priority: "medium",
    title: "Balanced Nutrition",
    description:
      "Follow a diet rich in fruits, vegetables, whole grains, and lean proteins while limiting processed foods.",
    category: "Nutrition",
    actionable: true,
    timeframe: "Daily",
  },
  {
    id: "prev-4",
    type: "lifestyle",
    priority: "medium",
    title: "Adequate Sleep",
    description: "Aim for 7-9 hours of quality sleep per night to support immune function and overall health.",
    category: "Sleep Hygiene",
    actionable: true,
    timeframe: "Nightly",
  },
  {
    id: "prev-5",
    type: "lifestyle",
    priority: "low",
    title: "Stress Management",
    description: "Practice stress-reduction techniques like meditation, deep breathing, or regular physical activity.",
    category: "Mental Health",
    actionable: true,
    timeframe: "Daily",
  },
]

// Age-specific suggestions
const ageSpecificSuggestions: Record<string, HealthSuggestion[]> = {
  "18-30": [
    {
      id: "age-young-1",
      type: "preventive",
      priority: "medium",
      title: "Establish Healthy Habits",
      description:
        "Build a foundation of good health habits including regular exercise, balanced diet, and avoiding smoking.",
      category: "Lifestyle Foundation",
      actionable: true,
      timeframe: "Ongoing",
    },
  ],
  "31-50": [
    {
      id: "age-mid-1",
      type: "preventive",
      priority: "medium",
      title: "Cardiovascular Health Monitoring",
      description: "Regular blood pressure and cholesterol checks become increasingly important in this age group.",
      category: "Heart Health",
      actionable: true,
      timeframe: "Every 2-3 years",
    },
  ],
  "51+": [
    {
      id: "age-senior-1",
      type: "preventive",
      priority: "high",
      title: "Comprehensive Health Screenings",
      description:
        "Increase frequency of health screenings including colonoscopy, mammography, and bone density tests.",
      category: "Age-Appropriate Screening",
      actionable: true,
      timeframe: "As recommended by physician",
    },
  ],
}

export function generateComprehensiveHealthSuggestions(
  patientProfile: PatientProfile,
  assignedDoctor?: any,
): HealthSuggestion[] {
  const suggestions: HealthSuggestion[] = []

  // Add symptom-specific suggestions
  patientProfile.symptoms.forEach((symptom) => {
    const symptomSuggestions = suggestionDatabase[symptom] || []
    suggestions.push(...symptomSuggestions)
  })

  // Add urgency-based suggestions
  if (patientProfile.urgency === "urgent" || patientProfile.urgency === "high") {
    suggestions.push({
      id: "urgent-1",
      type: "emergency",
      priority: "critical",
      title: "Immediate Medical Attention Required",
      description: "Your symptoms indicate a need for prompt medical evaluation. Do not delay seeking care.",
      category: "Emergency Care",
      actionable: true,
      timeframe: "Immediately",
    })
  }

  // Add age-specific suggestions
  const ageGroup = patientProfile.age <= 30 ? "18-30" : patientProfile.age <= 50 ? "31-50" : "51+"
  const ageSuggestions = ageSpecificSuggestions[ageGroup] || []
  suggestions.push(...ageSuggestions)

  // Add general preventive care (limit to 3 to avoid overwhelming)
  suggestions.push(...preventiveCare.slice(0, 3))

  // Add doctor-specific suggestion if assigned
  if (assignedDoctor) {
    suggestions.push({
      id: "doctor-assigned",
      type: "follow-up",
      priority: "high",
      title: "Consult Your Assigned Doctor",
      description: `You've been matched with ${assignedDoctor.name}, a ${assignedDoctor.specialty} specialist. Schedule an appointment to discuss your symptoms.`,
      category: "Medical Consultation",
      actionable: true,
      timeframe: "Within 24-48 hours",
    })
  }

  // Sort by priority and remove duplicates
  const uniqueSuggestions = suggestions.filter(
    (suggestion, index, self) => index === self.findIndex((s) => s.id === suggestion.id),
  )

  return uniqueSuggestions.sort((a, b) => {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })
}

export function getLifestyleTips(symptoms: string[]): HealthSuggestion[] {
  const tips: HealthSuggestion[] = [
    {
      id: "lifestyle-1",
      type: "lifestyle",
      priority: "medium",
      title: "Stay Hydrated",
      description: "Drink at least 8 glasses of water daily to support overall health and recovery.",
      category: "Hydration",
      actionable: true,
      timeframe: "Daily",
    },
    {
      id: "lifestyle-2",
      type: "lifestyle",
      priority: "medium",
      title: "Prioritize Sleep",
      description: "Ensure 7-9 hours of quality sleep to support your immune system and healing process.",
      category: "Sleep",
      actionable: true,
      timeframe: "Nightly",
    },
    {
      id: "lifestyle-3",
      type: "lifestyle",
      priority: "low",
      title: "Practice Mindfulness",
      description: "Consider meditation or deep breathing exercises to manage stress and promote healing.",
      category: "Mental Wellness",
      actionable: true,
      timeframe: "Daily, 10-15 minutes",
    },
  ]

  return tips
}

export function getEmergencyAlerts(symptoms: string[], urgency: string): HealthSuggestion[] {
  const alerts: HealthSuggestion[] = []

  // Critical symptom combinations
  const criticalCombinations = [
    ["Chest pain", "Shortness of breath"],
    ["Severe headache", "Fever", "Nausea"],
    ["Abdominal pain", "Vomiting", "Fever"],
  ]

  criticalCombinations.forEach((combination, index) => {
    if (combination.every((symptom) => symptoms.includes(symptom))) {
      alerts.push({
        id: `emergency-${index}`,
        type: "emergency",
        priority: "critical",
        title: "Critical Symptom Combination Detected",
        description: `The combination of ${combination.join(", ")} requires immediate medical attention. Call 911 or go to the nearest emergency room.`,
        category: "Emergency Alert",
        actionable: true,
        timeframe: "Immediately",
      })
    }
  })

  return alerts
}
