
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, User, Shield, Briefcase, FileBadge, BarChart, Sparkles, Loader2, TrendingUp, AlertTriangle, Trophy, Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { generateBusinessReportAction } from '@/app/actions';
import type { GenerateBusinessReportOutput } from '@/ai/schemas/business-report-schemas';
import { Checkbox } from '@/components/ui/checkbox';

// Mock Data representing the centralized document store
const mockData = {
    "Downtown": {
        "2024": {
            "July": {
                reports: [
                    { id: 1, name: "July Activity Log", type: 'Activity', date: "2024-07-31" },
                    { id: 2, name: "July Compliance Report", type: 'Compliance', date: "2024-07-31" },
                    { id: 3, name: "Manager's Performance Review", type: 'HR', date: "2024-07-25" }
                ],
                employees: [
                    { id: 1, name: "Casey Lee", certificates: [ { name: "Food Handler Permit", expires: "2025-06-01" }, { name: "Manager Certification", expires: "2026-01-01" }] },
                    { id: 2, name: "John Doe", certificates: [ { name: "Food Handler Permit", expires: "2024-08-15" } ] }
                ]
            },
            "June": {
                reports: [{ id: 4, name: "June Activity Log", type: 'Activity', date: "2024-06-30" }],
                employees: []
            }
        }
    },
    "Uptown": {
        "2024": {
            "July": {
                reports: [{ id: 5, name: "July Activity Log", type: 'Activity', date: "2024-07-31" }],
                employees: [ { id: 3, name: "Jane Smith", certificates: [ { name: "Food Handler Permit", expires: "2025-02-20" } ] }]
            }
        }
    }
};

type Report = { id: number; name: string; type: string; date: string; };
type Certificate = { name: string; expires: string; };
type EmployeeFile = { id: number; name: string; certificates: Certificate[]; };

export default function DocumentsPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<GenerateBusinessReportOutput | null>(null);
    const [analysisParams, setAnalysisParams] = useState({ location: 'Downtown', dateRange: 'Last 30 Days' });
    const [documentTypes, setDocumentTypes] = useState<string[]>(['Operational Reports', 'Employee Files']);
    const availableDocumentTypes = ['Operational Reports', 'Employee Files', 'Maintenance Logs'];

    const handleGenerateReport = async () => {
        setIsLoading(true);
        setAnalysisResult(null);

        try {
            const response = await generateBusinessReportAction({
                location: analysisParams.location,
                dateRange: analysisParams.dateRange,
                documentTypes: documentTypes
            });

            if (response.error || !response.data) {
                throw new Error(response.error || "Failed to generate report.");
            }
            setAnalysisResult(response.data);
            toast({
                title: "AI Analysis Complete!",
                description: "Your business report is ready for review.",
            });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'AI Error',
                description: error.message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const renderIcon = (type: string) => {
        switch(type) {
            case 'Activity': return <Briefcase className="h-4 w-4 text-blue-500" />;
            case 'Compliance': return <Shield className="h-4 w-4 text-green-500" />;
            case 'HR': return <User className="h-4 w-4 text-purple-500" />;
            default: return <FileText className="h-4 w-4 text-gray-500" />;
        }
    }

    return (
        <div className="space-y-6">
             <Card className="border-primary bg-primary/5">
                <CardHeader>
                    <CardTitle className="font-headline text-primary flex items-center gap-2"><Sparkles /> AI Business Analyst</CardTitle>
                    <CardDescription>Select a location, time period, and data types, and the AI will analyze all associated documents to generate a high-level strategic report.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-2">
                            <Label>Location</Label>
                            <Select value={analysisParams.location} onValueChange={(val) => setAnalysisParams(p => ({...p, location: val}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Locations">All Locations</SelectItem>
                                    {Object.keys(mockData).map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid gap-2">
                            <Label>Date Range</Label>
                            <Select value={analysisParams.dateRange} onValueChange={(val) => setAnalysisParams(p => ({...p, dateRange: val}))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
                                    <SelectItem value="Last Quarter">Last Quarter</SelectItem>
                                    <SelectItem value="Year-to-Date">Year-to-Date</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label>Data to Analyze</Label>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 items-center rounded-md border p-3">
                            {availableDocumentTypes.map(type => (
                                <div key={type} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={type}
                                        checked={documentTypes.includes(type)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                                ? setDocumentTypes([...documentTypes, type])
                                                : setDocumentTypes(documentTypes.filter((t) => t !== type));
                                        }}
                                    />
                                    <Label htmlFor={type} className="font-normal">{type}</Label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button onClick={handleGenerateReport} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BarChart className="mr-2 h-4 w-4" />}
                        Generate Report
                    </Button>

                    {analysisResult && (
                        <div className="pt-4 space-y-4">
                            <h3 className="text-lg font-semibold">Executive Summary</h3>
                            <p className="text-sm text-muted-foreground italic">"{analysisResult.executiveSummary}"</p>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp/> Trends</CardTitle></CardHeader>
                                    <CardContent><ul className="list-disc list-inside text-sm space-y-1">{analysisResult.identifiedTrends.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                                </Card>
                                 <Card>
                                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle/> Risk Factors</CardTitle></CardHeader>
                                    <CardContent><ul className="list-disc list-inside text-sm space-y-1">{analysisResult.riskFactors.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle className="text-base flex items-center gap-2"><Trophy/> Highlights</CardTitle></CardHeader>
                                    <CardContent><ul className="list-disc list-inside text-sm space-y-1">{analysisResult.performanceHighlights.map((item, i) => <li key={i}>{item}</li>)}</ul></CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><FileBadge /> Document Storage</CardTitle>
                    <CardDescription>A centralized archive of all operational documents, organized by location and date.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Accordion type="single" collapsible defaultValue="item-Downtown">
                       {Object.entries(mockData).map(([location, years]) => (
                           <AccordionItem key={location} value={`item-${location}`}>
                               <AccordionTrigger><div className="flex items-center gap-2 font-semibold text-lg"><Building className="h-5 w-5 text-primary"/>{location}</div></AccordionTrigger>
                               <AccordionContent className="pl-4">
                                   <Accordion type="single" collapsible defaultValue="item-2024">
                                       {Object.entries(years).map(([year, months]) => (
                                           <AccordionItem key={year} value={`item-${year}`}>
                                               <AccordionTrigger><div className="flex items-center gap-2 font-semibold"><Calendar className="h-4 w-4"/>{year}</div></AccordionTrigger>
                                               <AccordionContent className="pl-4 space-y-4">
                                                   {Object.entries(months).map(([month, data]) => (
                                                       <Card key={month}>
                                                           <CardHeader><CardTitle className="text-base">{month}</CardTitle></CardHeader>
                                                           <CardContent className="space-y-4">
                                                               <div>
                                                                    <h4 className="font-semibold text-sm mb-2">Operational Reports</h4>
                                                                    <Table>
                                                                        <TableHeader><TableRow><TableHead>Document</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
                                                                        <TableBody>{(data.reports as Report[]).map(r => <TableRow key={r.id}><TableCell className="flex items-center gap-2">{renderIcon(r.type)} {r.name}</TableCell><TableCell>{r.date}</TableCell></TableRow>)}</TableBody>
                                                                    </Table>
                                                               </div>
                                                                <div>
                                                                    <h4 className="font-semibold text-sm mb-2">Employee Files</h4>
                                                                    <Table>
                                                                        <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Certificate</TableHead><TableHead>Expires</TableHead></TableRow></TableHeader>
                                                                        <TableBody>
                                                                            {(data.employees as EmployeeFile[]).map(e => (
                                                                                e.certificates.map((cert, i) => (
                                                                                    <TableRow key={`${e.id}-${i}`}>
                                                                                        {i === 0 && <TableCell rowSpan={e.certificates.length} className="align-top font-medium">{e.name}</TableCell>}
                                                                                        <TableCell>{cert.name}</TableCell>
                                                                                        <TableCell><Badge variant={new Date(cert.expires) < new Date(new Date().setMonth(new Date().getMonth() + 1)) ? 'destructive' : 'secondary'}>{cert.expires}</Badge></TableCell>
                                                                                    </TableRow>
                                                                                ))
                                                                            ))}
                                                                        </TableBody>
                                                                    </Table>
                                                               </div>
                                                           </CardContent>
                                                       </Card>
                                                   ))}
                                               </AccordionContent>
                                           </AccordionItem>
                                       ))}
                                   </Accordion>
                               </AccordionContent>
                           </AccordionItem>
                       ))}
                   </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
