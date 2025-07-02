"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { Upload, Download } from "lucide-react"

export default function RuleExportImport() {
  const [exportData, setExportData] = useState("")
  const [importData, setImportData] = useState("")
  const { toast } = useToast()

  const exportRules = async () => {
    try {
      // In a real app, this would be an API call to /api/ai/list-rules
      // For this demo, we'll use mock data
      const mockRules = [{ ruleId: 'temp-high', condition: 'temp > 41', action: 'alert' }];
      const dataStr = JSON.stringify(mockRules, null, 2);
      setExportData(dataStr)
      toast({ title: "Rules Exported", description: "Rule configuration has been prepared." })
    } catch (e) {
      toast({ variant: "destructive", title: "Export Failed" })
    }
  }

  const importRules = async () => {
    try {
      if (!importData.trim()) {
          toast({ variant: 'destructive', title: 'No Data', description: 'Please paste JSON data to import.' });
          return;
      }
      const parsed = JSON.parse(importData)
      if (!Array.isArray(parsed)) throw new Error("Invalid JSON format. Must be an array of rules.")
      // In a real app, this would be an API call to /api/ai/import-rules
      toast({ title: "Import Successful", description: "Rules have been imported." })
    } catch (e: any) {
      toast({ variant: "destructive", title: "Import Failed", description: e.message })
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Download /> Export Rules</CardTitle>
          <CardDescription>Export your current AI agent rules as a JSON file for backup or migration.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={exportRules}>Export Current Rules</Button>
          {exportData && (
            <Textarea
              readOnly
              rows={10}
              className="w-full mt-4 font-mono text-xs"
              value={exportData}
            />
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Upload /> Import Rules</CardTitle>
          <CardDescription>Paste a valid JSON configuration file below to import a set of rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid gap-2">
                <Label htmlFor="import-data">Rules JSON Data</Label>
                <Textarea
                    id="import-data"
                    rows={10}
                    className="w-full font-mono text-xs"
                    placeholder="Paste rules JSON here..."
                    value={importData}
                    onChange={e => setImportData(e.target.value)}
                />
            </div>
          <Button onClick={importRules} disabled={!importData}>Import Rules</Button>
        </CardContent>
      </Card>
    </div>
  )
}
