
"use client"

import { useState } from "react"
import axios from "axios"
import { useCollection } from "react-firebase-hooks/firestore"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function RuleTriggerSimulator() {
  const [triggering, setTriggering] = useState(false)
  const [selectedRuleId, setSelectedRuleId] = useState("")
  const { toast } = useToast()

  // In a real app, 'rules' would be a real collection. For now, this hook will listen to a non-existent one.
  const [rulesSnapshot, rulesLoading] = useCollection(query(collection(db, "rules"), orderBy("createdAt", "desc")))
  const [logsSnapshot, logsLoading] = useCollection(query(collection(db, "agent_logs"), orderBy("timestamp", "desc"), limit(20)))

  const rules = rulesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string, triggerCondition: string, autoAction: string, locationId: string } })) ?? []
  const logs = logsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() as { agentId: string, message: string, timestamp: number } })) ?? []

  const triggerRule = async () => {
    setTriggering(true)
    try {
      const rule = rules.find(r => r.id === selectedRuleId)
      if (!rule) {
          toast({ variant: "destructive", title: "No rule selected."})
          return
      }

      await axios.post("/api/ai/trigger", {
        agentId: "admin-tester",
        action: rule.autoAction,
        locationId: rule.locationId,
        targetId: "demo-user",
        payload: { title: `[Simulated] ${rule.name}` },
      })

      toast({ title: "Trigger Sent", description: "Check logs below for agent activity."})
    } catch (e) {
      toast({ variant: "destructive", title: "Error triggering rule", description: (e as Error).message })
      console.error(e)
    }
    setTriggering(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🧪 Rule Trigger Simulator</CardTitle>
        <CardDescription>Manually trigger an AI agent rule to test its action and logging.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Rule</Label>
          <div className="flex gap-2">
            <Select
              value={selectedRuleId}
              onValueChange={setSelectedRuleId}
              disabled={rulesLoading}
            >
                <SelectTrigger>
                    <SelectValue placeholder={rulesLoading ? "Loading rules..." : "Choose a rule to trigger"} />
                </SelectTrigger>
                <SelectContent>
                    {rules.map(rule => (
                        <SelectItem key={rule.id} value={rule.id}>
                        {rule.name} ({rule.triggerCondition})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Button
              disabled={!selectedRuleId || triggering}
              onClick={triggerRule}
            >
              {triggering ? <Loader2 className="animate-spin" /> : "Trigger Now"}
            </Button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mt-6 mb-2">📋 Recent AI Agent Logs</h3>
          <div className="max-h-64 overflow-y-auto border rounded bg-muted/50 p-2 text-sm">
            {logsLoading && <p>Loading logs...</p>}
            {!logsLoading && logs.length === 0 && <p className="text-center p-4">No agent logs found.</p>}
            {logs.map((log) => (
              <div key={log.id} className="mb-2 border-b pb-1">
                <p><strong>{log.agentId}</strong>: {log.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
