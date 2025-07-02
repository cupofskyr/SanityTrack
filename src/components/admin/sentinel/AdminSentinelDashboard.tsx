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

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">⚙️ AI Sentinel Admin Dashboard</h1>

      <nav className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded ${
              activeTab === tab.id ? "bg-blue-600 text-white" : "bg-white border"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="bg-white p-6 rounded shadow min-h-[400px]">
        {activeTab === "rules" && <RulesDashboard />}
        {activeTab === "simulator" && <RuleTriggerSimulator />}
        {activeTab === "alerts" && <LiveAlertFeed />}
        {activeTab === "condition" && <ConditionTester />}
        {activeTab === "analytics" && <AnalyticsPanel />}
        {activeTab === "chat" && <ChatAgentTester />}
        {activeTab === "templates" && (
          <RuleTemplateSelector
            onSelectTemplate={tmpl => {
              alert(`Template selected: ${tmpl.name}\nIntegrate this to your Rule Editor form!`)
            }}
          />
        )}
        {activeTab === "importexport" && <RuleExportImport />}
      </div>
    </div>
  )
}
