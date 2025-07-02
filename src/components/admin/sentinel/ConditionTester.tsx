"use client"

import { useState } from "react"
import axios from "axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Check, X, Loader2 } from "lucide-react"

export default function ConditionTester() {
  const [condition, setCondition] = useState("")
  const [simulatedValue, setSimulatedValue] = useState("")
  const [result, setResult] = useState<boolean | null>(null)
  const [testing, setTesting] = useState(false)

  const testCondition = async () => {
    setTesting(true)
    setResult(null)
    try {
      // In a real app, this would be an API call.
      // We simulate the logic here for the prototype.
      // This is a very basic evaluator and should not be used in production.
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
      
      const val = parseFloat(simulatedValue);
      let match = false;
      if (!isNaN(val)) {
          if (condition.includes('>')) {
              const num = parseFloat(condition.split('>')[1]);
              if (!isNaN(num)) match = val > num;
          } else if (condition.includes('<')) {
              const num = parseFloat(condition.split('<')[1]);
              if (!isNaN(num)) match = val < num;
          } else if (condition.includes('=')) {
              const num = parseFloat(condition.split('=')[1]);
              if (!isNaN(num)) match = val === num;
          }
      }
      setResult(match)

    } catch (error) {
      console.error("Error testing condition:", error)
      setResult(false)
    } finally {
      setTesting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🔁 Condition Tester</CardTitle>
        <CardDescription>Test a single condition against a simulated value to see if it would trigger a rule.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="condition-input">Condition Logic</Label>
          <Input
            id="condition-input"
            placeholder='e.g. temperature > 41'
            value={condition}
            onChange={e => setCondition(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value-input">Simulated Input Value</Label>
          <Input
            id="value-input"
            placeholder="e.g. 45"
            value={simulatedValue}
            onChange={e => setSimulatedValue(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={testCondition} disabled={testing || !condition || !simulatedValue}>
            {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Test Match
          </Button>
          {result !== null && (
            <div className={`flex items-center gap-2 font-semibold ${result ? 'text-green-600' : 'text-red-600'}`}>
              {result ? <Check /> : <X />}
              {result ? "MATCHED" : "NO MATCH"}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
