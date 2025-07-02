"use client"

import { useState } from "react"
import RulesDashboard from "./RulesDashboard"
import RuleTriggerSimulator from "./RuleTriggerSimulator"
import LiveAlertFeed from "./LiveAlertFeed"
import ConditionTester from "./ConditionTester"
import AnalyticsPanel from "./AnalyticsPanel"
import ChatAgentTester from "./ChatAgentTester"
import RuleTemplateSelector from "./RuleTemplateSelector"
import RuleExportImport from "./RuleExportImport"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const tabs = [
  { id: "rules", label: "Rules" },
  { id: "simulator", label: "Trigger Simulator" },
  { id: "alerts", label: "Live Alerts" },
  { id: "condition", label: "Condition Tester" },
  { id: "analytics", label: "Analytics" },
  { id: "chat", label: "Chat Agent Tester" },
  { id: "templates", label: "Rule Templates" },
  { id: "importexport", label: "Import / Export" },
]

export default function AdminSentinelDashboard() {
  const [activeTab, setActiveTab] = useState("rules")
  const { toast } = useToast()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">⚙️ AI Sentinel Admin Dashboard</h1>

      <div className="flex flex-wrap gap-1 border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:bg-muted rounded-t-md",
              activeTab === tab.id ? "border-primary text-primary" : "text-muted-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>
        {activeTab === "rules" && <RulesDashboard />}
        {activeTab === "simulator" && <RuleTriggerSimulator />}
        {activeTab === "alerts" && <LiveAlertFeed />}
        {activeTab === "condition" && <ConditionTester />}
        {activeTab === "analytics" && <AnalyticsPanel />}
        {activeTab === "chat" && <ChatAgentTester />}
        {activeTab === "templates" && (
          <RuleTemplateSelector
            onSelectTemplate={tmpl => {
              toast({
                title: "Template Loaded",
                description: `Loaded template: ${tmpl.name}`,
              })
            }}
          />
        )}
        {activeTab === "importexport" && <RuleExportImport />}
      </div>
    </div>
  )
}
