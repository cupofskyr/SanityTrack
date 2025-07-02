
"use client";

import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useMemo } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, getFirestore, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { app } from "@/lib/firebase"; 
import { Printer, Tag, Sparkles, Loader2, Utensils, Calendar as CalendarIcon, Sun, CloudRain, ListTodo, Trash2, PlusCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { format, add } from "date-fns";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { generatePrepListAction } from "@/app/actions";
import type { GeneratePrepListOutput } from "@/ai/schemas/prep-list-schemas";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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

type ManualPrepItem = {
    id: string;
    itemName: string;
    quantity: number;
    notes?: string;
    shift: '1st' | '2nd';
};

export default function FoodPrepDashboard() {
  const { toast } = useToast();
  const [prepLogs, setPrepLogs] = useState<PrepLog[]>([]);
  
  // AI Prep List State
  const [restaurantType, setRestaurantType] = useState<'fast-food' | 'fine-dining' | 'casual-dining'>('casual-dining');
  const [weather, setWeather] = useState('Sunny and warm');
  const [events, setEvents] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<GeneratePrepListOutput | null>(null);

  // Manual Prep List State
  const [manualPrepShift, setManualPrepShift] = useState<'1st' | '2nd'>("1st");
  const [manualPrepItems, setManualPrepItems] = useState<ManualPrepItem[]>([]);
  const [newManualItem, setNewManualItem] = useState({ itemName: "", quantity: "", notes: "" });
  
  // Firestore hooks
  const [prepLogSnapshot, prepLogLoading] = useCollection(collection(db, "prep-logs"));
  const manualPrepQuery = query(collection(db, "manual-prep"), where("shift", "==", manualPrepShift), orderBy("timestamp", "asc"));
  const [manualSnapshot, manualLoading] = useCollection(manualPrepQuery);
  
  // Labeling State
  const [labelData, setLabelData] = useState<{name: string, prepDate: Date, useByDate: Date, qrData: string} | null>(null);
  const [selectedItemForLabel, setSelectedItemForLabel] = useState('');

  // Effect for simulated prep logs
  useEffect(() => {
    const isOffline = typeof window !== 'undefined' ? !navigator.onLine : true;
    if (!prepLogLoading && prepLogSnapshot) {
      const data = prepLogSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as PrepLog));
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
  }, [prepLogSnapshot, prepLogLoading]);

  // Effect for manual prep items
  useEffect(() => {
    if (!manualLoading && manualSnapshot) {
        const data = manualSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ManualPrepItem));
        setManualPrepItems(data);
    }
  }, [manualSnapshot, manualLoading]);

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

  const handlePrintLabel = () => { window.print(); }

  const inventoryItemsForLabel = useMemo(() => {
    return [
      "Caesar Salad", "Burger Patties", "Fries", "Chicken Wrap Mix", 
      "Lobster Bisque", "Filet Mignon", "Truffle Caesar Salad", "Soda Cups"
    ].filter((v, i, a) => a.indexOf(v) === i);
  }, []);

  const handleGeneratePrepList = async () => {
    setIsGenerating(true);
    setAiResult(null);
    try {
        const today = new Date();
        const dayOfWeek = format(today, 'EEEE');
        const historicalSales = "Burger Patties (55 sold), Fries (70 sold), Caesar Salad (30 sold), Chicken Wrap Mix (25 sold)";
        const result = await generatePrepListAction({ restaurantType, dayOfWeek, weather, events, historicalSales });
        if (result.error || !result.data) { throw new Error(result.error || "The AI failed to generate a prep list."); }
        setAiResult(result.data);
    } catch (e: any) {
        toast({ variant: "destructive", title: "AI Generation Failed", description: e.message });
    } finally {
        setIsGenerating(false);
    }
  };

  // Manual Prep Handlers
  const addManualItem = async () => {
    if (!newManualItem.itemName || !newManualItem.quantity) {
      toast({ variant: 'destructive', title: "Missing Fields", description: "Please enter at least an item name and quantity." });
      return;
    }
    await addDoc(collection(db, "manual-prep"), {
      ...newManualItem,
      quantity: Number(newManualItem.quantity),
      shift: manualPrepShift,
      timestamp: serverTimestamp(),
    });
    setNewManualItem({ itemName: "", quantity: "", notes: "" });
  };

  const updateManualItem = async (id: string, field: keyof ManualPrepItem, value: string | number) => {
    const docRef = doc(db, "manual-prep", id);
    await updateDoc(docRef, { [field]: value });
  };

  const deleteManualItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this prep item?")) {
      await deleteDoc(doc(db, "manual-prep", id));
    }
  };

  const createTasksForShift = () => {
    toast({ title: 'Task Creation Triggered', description: `Tasks created for ${manualPrepShift} shift prep items.` });
  };

  return (
    <div className="space-y-4">
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="waste">Prep Variance</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
        <TabsTrigger value="prepgen">Prep List AI</TabsTrigger>
        <TabsTrigger value="manualprep">Manual Prep</TabsTrigger>
        <TabsTrigger value="labeling">Labeling</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{/* Existing content */}</TabsContent>
      <TabsContent value="waste">{/* Existing content */}</TabsContent>
      <TabsContent value="forecast">{/* Existing content */}</TabsContent>
      <TabsContent value="prepgen">{/* Existing content */}</TabsContent>

      <TabsContent value="manualprep">
        <Card>
            <CardHeader>
                <CardTitle>Manual Prep List Editor</CardTitle>
                <CardDescription>A real-time, shared prep list for your team. Changes are saved instantly.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mb-4">
                     <ToggleGroup type="single" value={manualPrepShift} onValueChange={(value) => value && setManualPrepShift(value as '1st' | '2nd')} variant="outline">
                        <ToggleGroupItem value="1st">1st Shift</ToggleGroupItem>
                        <ToggleGroupItem value="2nd">2nd Shift</ToggleGroupItem>
                    </ToggleGroup>
                    <Button onClick={createTasksForShift}><ListTodo className="mr-2 h-4 w-4" /> Create Tasks for Shift Prep</Button>
                </div>
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader><TableRow><TableHead className="w-[35%]">Item Name</TableHead><TableHead className="w-[15%]">Quantity</TableHead><TableHead>Notes</TableHead><TableHead className="w-[100px]">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {manualPrepItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell><Input type="text" value={item.itemName} onChange={(e) => updateManualItem(item.id, "itemName", e.target.value)} className="border-none px-1" /></TableCell>
                                    <TableCell><Input type="number" value={item.quantity} onChange={(e) => updateManualItem(item.id, "quantity", Number(e.target.value))} className="border-none px-1" /></TableCell>
                                    <TableCell><Input type="text" value={item.notes || ""} onChange={(e) => updateManualItem(item.id, "notes", e.target.value)} className="border-none px-1" /></TableCell>
                                    <TableCell><Button variant="ghost" size="icon" onClick={() => deleteManualItem(item.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
                                </TableRow>
                            ))}
                             <TableRow className="bg-muted/50">
                                <TableCell><Input placeholder="New item name..." value={newManualItem.itemName} onChange={(e) => setNewManualItem({...newManualItem, itemName: e.target.value})} className="border-none px-1 bg-transparent"/></TableCell>
                                <TableCell><Input type="number" placeholder="Qty" value={newManualItem.quantity} onChange={(e) => setNewManualItem({...newManualItem, quantity: e.target.value})} className="border-none px-1 bg-transparent"/></TableCell>
                                <TableCell><Input placeholder="Notes..." value={newManualItem.notes} onChange={(e) => setNewManualItem({...newManualItem, notes: e.target.value})} className="border-none px-1 bg-transparent"/></TableCell>
                                <TableCell><Button size="sm" disabled={!newManualItem.itemName || !newManualItem.quantity} onClick={addManualItem}><PlusCircle className="mr-2 h-4 w-4"/>Add</Button></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
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
                            <SelectTrigger id="label-item"><SelectValue placeholder="Select an item to label..." /></SelectTrigger>
                            <SelectContent>{inventoryItemsForLabel.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
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
                                <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${labelData.qrData}`} width={80} height={80} alt="Shelf-life QR Code" />
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
