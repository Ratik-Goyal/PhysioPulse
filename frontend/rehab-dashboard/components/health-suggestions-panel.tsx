import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Heart, Shield, Clock, CheckCircle, Info } from "lucide-react"
import type { HealthSuggestion } from "@/lib/health-suggestions"

interface HealthSuggestionsPanelProps {
  suggestions: HealthSuggestion[]
  title?: string
  showActions?: boolean
}

export function HealthSuggestionsPanel({
  suggestions,
  title = "Health Suggestions",
  showActions = true,
}: HealthSuggestionsPanelProps) {
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <Info className="h-4 w-4 text-blue-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "medium":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "emergency":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "preventive":
        return <Shield className="h-4 w-4 text-blue-500" />
      case "lifestyle":
        return <Heart className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const groupedSuggestions = suggestions.reduce(
    (groups, suggestion) => {
      const key = suggestion.priority
      if (!groups[key]) {
        groups[key] = []
      }
      groups[key].push(suggestion)
      return groups
    },
    {} as Record<string, HealthSuggestion[]>,
  )

  const priorityOrder = ["critical", "high", "medium", "low"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {priorityOrder.map((priority) => {
            const prioritySuggestions = groupedSuggestions[priority]
            if (!prioritySuggestions || prioritySuggestions.length === 0) return null

            return (
              <div key={priority}>
                <div className="flex items-center gap-2 mb-3">
                  {getPriorityIcon(priority)}
                  <h4 className="font-semibold capitalize">{priority} Priority</h4>
                  <Badge variant="outline" className={getPriorityColor(priority)}>
                    {prioritySuggestions.length} suggestion{prioritySuggestions.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {prioritySuggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 ${getPriorityColor(suggestion.priority)} bg-opacity-50`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(suggestion.type)}
                          <h5 className="font-semibold">{suggestion.title}</h5>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category}
                          </Badge>
                          {suggestion.timeframe && (
                            <Badge variant="secondary" className="text-xs">
                              {suggestion.timeframe}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <p className="text-sm text-foreground mb-3">{suggestion.description}</p>

                      {showActions && suggestion.actionable && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Mark as Done
                          </Button>
                          <Button size="sm" variant="ghost">
                            Remind Me Later
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {priority !== "low" && <Separator className="mt-4" />}
              </div>
            )
          })}

          {suggestions.length === 0 && (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Health Suggestions</h3>
              <p className="text-muted-foreground">
                Complete your health assessment to receive personalized recommendations.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
