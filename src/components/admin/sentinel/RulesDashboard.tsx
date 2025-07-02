
"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

export default function RulesDashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Agent Rules</CardTitle>
        <CardDescription>
          This is where you will manage the rules for the AI Sentinel. (Component under construction)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">The rules editor and list view will be displayed here.</p>
      </CardContent>
    </Card>
  )
}
