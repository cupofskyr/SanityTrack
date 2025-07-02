
"use client";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase"; // Use the shared firebase instance
import { Printer, Tag } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, add } from "date-fns";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";


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
  
  const [snapshot, loading] = useCollection(collection(db, "prep-logs"));
  
  const [labelData, setLabelData] = useState<{name: string, prepDate: Date, useByDate: Date, qrData: string} | null>(null);
  const [selectedItemForLabel, setSelectedItemForLabel] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const isOffline = !navigator.onLine;
        if (!loading && snapshot) {
          const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PrepLog));
          setPrepList(data);
          localStorage.setItem("prepListCache", JSON.stringify(data));
        } else if (isOffline) {
          const cached = localStorage.getItem("prepListCache");
          if (cached) {
              setPrepList(JSON.parse(cached));
          }
        }
    }
  }, [snapshot, loading]);

  const exportToQR = () => {
    const data = encodeURIComponent(JSON.stringify(prepList));
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}`;
    window.open(qrURL, "_blank");
  };

  const handleGenerateLabel = () => {
      if (!selectedItemForLabel) {
          toast({ variant: 'destructive', title: 'Please select an item.' });
          return;
      }
      const prepDate = new Date();
      const useByDate = add(prepDate, { days: 3 }); // Default 3 day shelf life
      const qrData = JSON.stringify({
          item: selectedItemForLabel,
          prep: prepDate.toISOString(),
          useBy: useByDate.toISOString(),
      });
      setLabelData({
          name: selectedItemForLabel,
          prepDate,
          useByDate,
          qrData: encodeURIComponent(qrData),
      });
  };

  const handlePrintLabel = () => {
      window.print();
  }

  const activePrepItems = generatePrepList(prepType);
  const inventoryItemsForLabel = useMemo(() => {
    // In a real app, this would come from the inventory management page.
    // For now, we'll use a mocked list based on the prep list generator.
    return [
      "Caesar Salad", "Burger Patties", "Fries", "Chicken Wrap Mix", 
      "Lobster Bisque", "Filet Mignon", "Truffle Caesar Salad",
      "Soda Cups"
    ].filter((v, i, a) => a.indexOf(v) === i); // Unique items
  }, []);

  return (
    <div className="space-y-4">
    <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="waste">Prep Variance</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
        <TabsTrigger value="prepgen">Prep List AI</TabsTrigger>
        <TabsTrigger value="labeling">Labeling</TabsTrigger>
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
                    <td>{(item.prepped || 0) - (item.sold || 0)}</td>
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

      <TabsContent value="labeling">
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag /> Generate Shelf-Life Label</CardTitle>
                    <CardDescription>Select an item to generate a standardized label. This is optional and useful if you have a label printer.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="label-item">Prep Item</Label>
                        <Select value={selectedItemForLabel} onValueChange={setSelectedItemForLabel}>
                            <SelectTrigger id="label-item">
                                <SelectValue placeholder="Select an item to label..." />
                            </SelectTrigger>
                            <SelectContent>
                                {inventoryItemsForLabel.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={handleGenerateLabel} className="w-full">Generate Label</Button>
                </CardContent>
            </Card>

            {labelData && (
                <Card>
                    <CardHeader>
                         <CardTitle className="flex items-center justify-between">Label Preview <Button size="sm" onClick={handlePrintLabel}><Printer className="mr-2 h-4 w-4"/> Print</Button></CardTitle>
                        <CardDescription>This is a preview of the label that will be printed.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center">
                        <div id="printable" className="printable-area p-1">
                           <div className="w-80 border-2 border-dashed rounded-lg p-4 space-y-2 bg-background text-foreground">
                              <h3 className="text-lg font-bold text-center">{labelData.name}</h3>
                              <div className="flex justify-between items-center">
                                <div className="text-sm space-y-1">
                                    <p><strong>Prepped:</strong> {format(labelData.prepDate, 'MM/dd p')}</p>
                                    <p className="font-bold"><strong>USE BY:</strong> {format(labelData.useByDate, 'MM/dd p')}</p>
                                </div>
                                <Image 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${labelData.qrData}`}
                                    width={80}
                                    height={80}
                                    alt="Shelf-life QR Code"
                                />
                              </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
      </TabsContent>
    </Tabs>
    </div>
  );
}
