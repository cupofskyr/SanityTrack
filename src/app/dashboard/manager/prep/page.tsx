
"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase"; // Use the shared firebase instance

const db = getFirestore(app);

const mockHeatmap = [
  { day: "Mon", alignment: 85 },
  { day: "Tue", alignment: 72 },
  { day: "Wed", alignment: 90 },
  { day: "Thu", alignment: 60 },
  { day: "Fri", alignment: 95 },
];

const generatePrepList = (type = "default") => {
  if (type === "fast") {
    return [
      "🍟 Fries: 100 batches",
      "🍔 Burger Patties: 80 pieces",
      "🥤 Soda Cups: 120",
    ];
  } else if (type === "fine") {
    return [
      "🦞 Lobster Bisque: 20 bowls",
      "🥩 Filet Mignon: 30 portions",
      "🥗 Truffle Caesar Salad: 25 portions",
    ];
  }
  return [
    "🥗 Caesar Salad: 24 portions",
    "🍔 Burger Patties: 36 pieces",
    "🍟 Fries: 50 batches",
    "🌯 Chicken Wrap Mix: 18 servings",
  ];
};

type PrepLog = {
    id: string;
    name: string;
    prepped: number;
    sold: number;
}

export default function FoodPrepDashboard() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [prepList, setPrepList] = useState<PrepLog[]>([]);
  const [prepType, setPrepType] = useState("default");
  
  // The useCollection hook will now correctly use the shared db instance.
  // Note: This will only work if a 'prep-logs' collection exists in your Firestore.
  const [snapshot, loading] = useCollection(collection(db, "prep-logs"));
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  useEffect(() => {
    if (!loading && snapshot) {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PrepLog));
      setPrepList(data);
      if(typeof window !== 'undefined') {
        localStorage.setItem("prepListCache", JSON.stringify(data));
      }
    } else if (isOffline) {
      if(typeof window !== 'undefined') {
        const cached = localStorage.getItem("prepListCache");
        if (cached) {
            setPrepList(JSON.parse(cached));
        }
      }
    }
  }, [snapshot, loading, isOffline]);

  const exportToQR = () => {
    const data = encodeURIComponent(JSON.stringify(prepList));
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
    window.open(qrURL, "_blank");
  };

  const activePrepItems = generatePrepList(prepType);

  return (
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="p-4 space-y-4 text-lg">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="waste">Prep Variance</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
        <TabsTrigger value="prepgen">Prep List AI</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="text-lg font-semibold">Cold Prep Compliance</CardHeader>
            <CardContent>
              <p>Cooler temp: 3.2°C</p>
              <p>Door opens: 18x today</p>
              <p>Risk alerts: None</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-lg font-semibold">Shelf Life Alerts</CardHeader>
            <CardContent>
              <p>⏱️ Tuna Salad: 3 hours left</p>
              <p>⚠️ Chicken Mix: 1.5 hours left</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-lg font-semibold">Prep Karma Score</CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">88</p>
              <p className="text-sm text-muted-foreground">0 missed 86s, 2 assists, 1 waste save</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="waste">
        <Card>
          <CardHeader className="text-lg font-semibold">Prep-to-Plate Variance</CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-left">Prepped</th>
                  <th className="text-left">Sold</th>
                  <th className="text-left">Waste</th>
                </tr>
              </thead>
              <tbody>
                {prepList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.prepped}</td>
                    <td>{item.sold}</td>
                    <td>{item.prepped - item.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="forecast">
        <Card>
          <CardHeader className="text-lg font-semibold">Prep vs Sales Forecast Alignment</CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockHeatmap}>
                <XAxis dataKey="day" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="alignment" fill="#4ade80" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="prepgen">
        <Card>
          <CardHeader className="text-lg font-semibold">Smart Prep List Generator</CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-medium">Style:</span>
              <Button variant={prepType === "fast" ? "default" : "outline"} onClick={() => setPrepType("fast")}>Fast Food</Button>
              <Button variant={prepType === "fine" ? "default" : "outline"} onClick={() => setPrepType("fine")}>Fine Dining</Button>
              <Button variant={prepType === "default" ? "default" : "outline"} onClick={() => setPrepType("default")}>Standard</Button>
            </div>
            <ul className="list-disc ml-4 space-y-1">
              {activePrepItems.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
            <div className="mt-4 space-x-2">
              <Button variant="outline" onClick={() => window.print()}>Print Prep List</Button>
              <Button variant="secondary" onClick={exportToQR}>Export QR</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
