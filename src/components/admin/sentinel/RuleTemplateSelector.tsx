"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const templates = [
  {
    id: "handwash-alert",
    name: "Handwash Alert",
    description: "Alert when no handwash detected for more than 60 minutes.",
    triggerCondition: "no_handwash > 60min",
    frequency: "daily",
    severity: "high",
    assignedToRole: "manager",
    autoAction: "notifyManager",
  },
  {
    id: "spill-detected",
    name: "Spill Detected",
    description: "Detect spills and alert cleaning staff immediately.",
    triggerCondition: "spill_detected == true",
    frequency: "once",
    severity: "high",
    assignedToRole: "employee",
    autoAction: "assignTask",
  },
  {
    id: "temp-missing",
    name: "Temperature Log Missing",
    description: "Notify manager if temperature log not submitted on time.",
    triggerCondition: "manual_temp_missing == true",
    frequency: "daily",
    severity: "medium",
    assignedToRole: "manager",
    autoAction: "notifyManager",
  },
]

type Template = typeof templates[0]

type Props = {
  onSelectTemplate: (template: Partial<Template>) => void
}

export default function RuleTemplateSelector({ onSelectTemplate }: Props) {
  const [selectedId, setSelectedId] = useState("")

  const handleSelect = () => {
    const tmpl = templates.find(t => t.id === selectedId)
    if (tmpl) onSelectTemplate(tmpl)
  }

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>⚙️ Rule Automation Templates</CardTitle>
        <CardDescription>
          Start with a pre-defined template to quickly create a new rule.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a template..." />
          </SelectTrigger>
          <SelectContent>
            {templates.map(t => (
              <SelectItem key={t.id} value={t.id}>
                {t.name} - {t.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleSelect}
          disabled={!selectedId}
        >
          Load Template
        </Button>
      </CardContent>
    </Card>
  )
}
