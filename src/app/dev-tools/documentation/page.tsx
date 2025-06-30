
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BrainCircuit } from 'lucide-react';

export default function HandbookPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2 text-2xl">
                    <BrainCircuit className="h-6 w-6 text-primary"/>
                    The Leifur AI System Handbook
                </CardTitle>
                <CardDescription>
                    The official blueprint for the AI's philosophy, features, and knowledge management protocol.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger className="text-lg font-semibold">Part I: Directive and Philosophy</AccordionTrigger>
                        <AccordionContent className="prose prose-sm dark:prose-invert max-w-none space-y-4 px-2">
                             <h4 className="font-semibold">Section 1.1: Core Mandate for the AI Assistant</h4>
                             <p>The primary function of this dashboard and its integrated AI assistant extends beyond mere data visualization; it is conceived as a cognitive enhancement platform. The AI's core mandate is to curate, synthesize, and present information in a manner that actively cultivates a systems thinking mindset in the manager. This involves guiding the user away from conventional, linear modes of analysis toward a more holistic, dynamic, and interconnected worldview. The ultimate purpose is to equip the manager with the conceptual tools necessary to solve complex, "wicked" problems, anticipate and avoid unintended consequences, and achieve lasting, sustainable results within their organization and its environment.</p>
                             <p>Success for the AI is not measured by the volume of data consumed by the user, but by the user's demonstrably enhanced ability to "see the whole" system rather than just its constituent parts, to identify high-leverage points for intervention, and to "dance with systems"—that is, to respond and adapt to their behavior—rather than attempting to exert absolute control over them.</p>

                             <h4 className="font-semibold">Section 1.2: The Guiding Philosophy - From "What" to "Why"</h4>
                             <p>The dashboard is engineered to facilitate a fundamental philosophical shift in problem analysis. This shift moves the user's focus from a superficial observation of isolated events (the "what happened?") to a deeper understanding of recurring patterns of behavior over time (the "what's been happening?"). The most critical step in this progression is surfacing the underlying systemic structures, feedback loops, and mental models that generate these patterns and events (the "why is this happening?").</p>
                             <p>A core element of this guiding philosophy is the cultivation of epistemological humility. The assumption that more data automatically leads to better control is a "terrible mistake." Therefore, the AI's operational philosophy must be one of inquiry, not simply information delivery. Its tone will be programmed to be inquisitive, presenting information not as definitive truth but as a perspective on a complex, evolving reality. The objective is to make the manager comfortable with ambiguity and "not-knowing," viewing surprises and failures not as setbacks but as invaluable opportunities for learning and adaptation.</p>
                        </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                        <AccordionTrigger className="text-lg font-semibold">Part II: Core Feature Guide</AccordionTrigger>
                        <AccordionContent className="prose prose-sm dark:prose-invert max-w-none space-y-4 px-2">
                            <p>This section details the primary features of the application, organized by operational theme.</p>
                            <h4 className="font-semibold">Theme 1: AI Sentinel & Autonomous Operations</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>AI Monitoring Setup (Owner):</strong> Owners can add virtual "cameras" and provide natural language instructions telling the AI what to look for (e.g., "Count customers in line," "Check for spills").</li>
                                <li><strong>Sentinel Agent Rules (Owner):</strong> The "brain" of the AI. Owners can enable/disable predefined rules or create custom "IF... THEN..." rules in plain English.</li>
                                <li><strong>Service Recovery & Wait Time Alerts (Owner/Employee):</strong> AI detects long wait times from camera feeds, creates an alert for the owner, who can then authorize a recovery action for an employee to execute.</li>
                            </ul>
                            <h4 className="font-semibold">Theme 2: Team & Quality Management</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Shift Planner (Manager/Owner):</strong> Managers define shifts and use AI to generate an optimal schedule based on employee availability and historical sales data.</li>
                                <li><strong>Live Time Clock & AI Punctuality Warnings (Manager):</strong> Simulates a live feed of employee clock-ins. If an employee is late, the manager can have the AI draft a professional warning email.</li>
                                <li><strong>Quality Control & Golden Standards (Manager/Owner):</strong> Managers define "golden standard" photos for menu items. The AI compares a photo of a freshly made dish against the standard, receiving a quality score and specific feedback.</li>
                                <li><strong>Kitchen Display System (KDS) Alerts:</strong> A dedicated, always-on screen for the kitchen that flashes and sounds an alarm when a QA check fails.</li>
                            </ul>
                            <h4 className="font-semibold">And many more themes including Inventory, Marketing, and Training...</h4>
                        </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="item-3">
                        <AccordionTrigger className="text-lg font-semibold">Part III: Knowledge Ingestion Protocol</AccordionTrigger>
                        <AccordionContent className="prose prose-sm dark:prose-invert max-w-none space-y-4 px-2">
                             <p>This protocol provides a clear, step-by-step process for a Subject Matter Expert (SME) to add new, approved knowledge into the AI's knowledge base (The "Company Brain"). This ensures all new content is structured correctly, maintaining the quality and integrity of the system.</p>
                             <h4 className="font-semibold">Step 1: Source Identification and Acquisition</h4>
                             <p>The SME identifies a new, high-quality piece of content (e.g., new menu specs, updated safety policy) and assigns it a unique Source_ID.</p>

                             <h4 className="font-semibold">Step 2: Deconstruction and Synthesis</h4>
                             <p>The SME reads and digests the source material, extracting key concepts. You do not simply upload the whole document. You must break it down into manageable chunks for the AI.</p>
                             
                             <h4 className="font-semibold">Step 3: Populating the Ingestion Templates</h4>
                             <p>The SME uses simple spreadsheets to format the new knowledge. The development team creates scripts to automatically parse these files.</p>
                             
                             <h4 className="font-semibold">Step 4: Submitting Content for Processing</h4>
                             <p>The SME places the updated .csv files into a designated shared folder.</p>

                             <h4 className="font-semibold">Step 5: Automated Processing and Indexing</h4>
                             <p>This step is handled by the technical team. An automated script reads the new rows, processes the text through an embedding model, and stores the resulting vectors in the AI's Vector Database. The new knowledge is now part of the AI's "brain".</p>
                             
                             <h4 className="font-semibold">Step 6: Verification and Quality Assurance</h4>
                             <p>The SME must verify that the new content appears correctly by querying the "Company Brain" with questions related to the new content to ensure it is being retrieved and synthesized accurately.</p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    );
}
