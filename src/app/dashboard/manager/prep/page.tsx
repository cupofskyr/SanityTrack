
"use client";

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase"; 
import { Printer, Tag, Sparkles, Loader2, Utensils, Calendar as CalendarIcon, Sun, CloudRain } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, add, getDay } from "date-fns";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { generatePrepListAction } from "@/app/actions";
import type { GeneratePrepListOutput } from "@/ai/schemas/prep-list-schemas";

const db = getFirestore(app);

const mockHeatmap = [
  { day: "Mon", alignment: 85 },
  { day: "Tue", alignment: 72 },
  { day: "Wed", alignment: 90 },
  { day: "Thu", alignment: 60 },
  { day: "Fri", alignment: 95 },
];

type PrepLog = {
    id: string;
    name: string;
    prepped: number;
    sold: number;
}

export default function FoodPrepDashboard() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("overview");
  const [prepLogs, setPrepLogs] = useState<PrepLog[]>([]);
  
  // AI Prep List State
  const [restaurantType, setRestaurantType] = useState<'fast-food' | 'fine-dining' | 'casual-dining'>('casual-dining');
  const [weather, setWeather] = useState('Sunny and warm');
  const [events, setEvents] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<GeneratePrepListOutput | null>(null);

  const [snapshot, loading] = useCollection(collection(db, "prep-logs"));
  
  // Labeling State
  const [labelData, setLabelData] = useState<{name: string, prepDate: Date, useByDate: Date, qrData: string} | null>(null);
  const [selectedItemForLabel, setSelectedItemForLabel] = useState('');

  useEffect(() => {
    const isOffline = typeof window !== 'undefined' ? !navigator.onLine : true;
    if (!loading && snapshot) {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PrepLog));
      setPrepLogs(data);
      if (typeof window !== 'undefined') {
        localStorage.setItem("prepListCache", JSON.stringify(data));
      }
    } else if (isOffline && typeof window !== 'undefined') {
      const cached = localStorage.getItem("prepListCache");
      if (cached) {
          setPrepLogs(JSON.parse(cached));
      }
    }
  }, [snapshot, loading]);

  const exportToQR = () => {
    if (!aiResult) return;
    const data = encodeURIComponent(JSON.stringify(aiResult.prepList));
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

  const inventoryItemsForLabel = useMemo(() => {
    // In a real app, this would come from the inventory management page.
    // For now, we'll use a mocked list.
    return [
      "Caesar Salad", "Burger Patties", "Fries", "Chicken Wrap Mix", 
      "Lobster Bisque", "Filet Mignon", "Truffle Caesar Salad",
      "Soda Cups"
    ].filter((v, i, a) => a.indexOf(v) === i); // Unique items
  }, []);

  const handleGeneratePrepList = async () => {
    setIsGenerating(true);
    setAiResult(null);
    try {
        const today = new Date();
        const dayOfWeek = format(today, 'EEEE'); // e.g., "Monday"
        
        // This is a simplified simulation of fetching historical sales data
        const historicalSales = "Burger Patties (55 sold), Fries (70 sold), Caesar Salad (30 sold), Chicken Wrap Mix (25 sold)";

        const result = await generatePrepListAction({
            restaurantType,
            dayOfWeek,
            weather,
            events,
            historicalSales,
        });

        if (result.error || !result.data) {
            throw new Error(result.error || "The AI failed to generate a prep list.");
        }
        setAiResult(result.data);
    } catch (e: any) {
        toast({
            variant: "destructive",
            title: "AI Generation Failed",
            description: e.message,
        });
    } finally {
        setIsGenerating(false);
    }
  };


  return (
    <div className="space-y-4">
    <Tabs defaultValue="overview" onValueChange={setSelectedTab} className="space-y-4">
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
            <CardHeader><CardTitle className="text-lg font-semibold">Cold Prep Compliance</CardTitle></CardHeader>
            <CardContent>
              <p>Cooler temp: 3.2°C</p>
              <p>Door opens: 18x today</p>
              <p>Risk alerts: None</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold">Shelf Life Alerts</CardTitle></CardHeader>
            <CardContent>
              <p>⏱️ Tuna Salad: 3 hours left</p>
              <p>⚠️ Chicken Mix: 1.5 hours left</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg font-semibold">Prep Karma Score</CardTitle></CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">88</p>
              <p className="text-sm text-muted-foreground">0 missed 86s, 2 assists, 1 waste save</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="waste">
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">Prep-to-Plate Variance</CardTitle></CardHeader>
          <CardContent>
            <Alert>
                <AlertTitle>Note on Data Source</AlertTitle>
                <AlertDescription>This data is a simulation based on the `prep-logs` Firestore collection. In a real application, you would log prepped items and subtract sold items from your POS data to calculate this variance.</AlertDescription>
            </Alert>
            <table className="w-full text-sm mt-4">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Prepped</th>
                  <th className="text-left p-2">Sold</th>
                  <th className="text-left p-2">Waste</th>
                </tr>
              </thead>
              <tbody>
                {prepLogs.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2">{item.name}</td>
                    <td className="p-2">{item.prepped}</td>
                    <td className="p-2">{item.sold}</td>
                    <td className="p-2 font-semibold">{(item.prepped || 0) - (item.sold || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="forecast">
        <Card>
          <CardHeader><CardTitle className="text-lg font-semibold">Prep vs Sales Forecast Alignment</CardTitle></CardHeader>
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
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/>Smart Prep List Generator</CardTitle>
            <CardDescription>Provide today's context. The AI will analyze it with historical data to generate an optimized prep list.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="restaurant-type">Restaurant Type</Label>
                    <Select value={restaurantType} onValueChange={(val) => setRestaurantType(val as any)}>
                        <SelectTrigger id="restaurant-type"><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="casual-dining">Casual Dining</SelectItem>
                            <SelectItem value="fast-food">Fast Food</SelectItem>
                            <SelectItem value="fine-dining">Fine Dining</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="weather">Today's Weather</Label>
                    <Input id="weather" value={weather} onChange={(e) => setWeather(e.target.value)} placeholder="e.g., Sunny and warm"/>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="events">Local Events / Bookings</Label>
                    <Input id="events" value={events} onChange={(e) => setEvents(e.target.value)} placeholder="e.g., Downtown concert"/>
                </div>
            </div>
            <Button onClick={handleGeneratePrepList} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4"/>}
                Generate AI Prep List
            </Button>
            {aiResult && (
                <div className="space-y-4 pt-4 border-t">
                    <Alert>
                        <AlertTitle className="font-semibold">AI Reasoning</AlertTitle>
                        <AlertDescription>{aiResult.reasoning}</AlertDescription>
                    </Alert>
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Quantity to Prep</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {aiResult.prepList.map((item, i) => (
                                    <TableRow key={i}>
                                        <TableCell className="font-medium">{item.item}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()}>Print Prep List</Button>
                        <Button variant="secondary" onClick={exportToQR}>Export QR</Button>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="labeling">
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Tag /> Generate Shelf-Life Label</CardTitle>
                    <CardDescription>Select an item to generate a standardized label. This is an optional tool, useful if you have a label printer.</CardDescription>
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
