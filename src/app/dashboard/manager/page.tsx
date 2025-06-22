import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, AlertTriangle, Sparkles, Flag } from "lucide-react";
import AIRecommendationForm from "@/components/ai-recommendation-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const teamMembers = [
    { name: "John Doe", tasksCompleted: 8, tasksPending: 2, progress: 80 },
    { name: "Jane Smith", tasksCompleted: 5, tasksPending: 5, progress: 50 },
    { name: "Sam Wilson", tasksCompleted: 10, tasksPending: 0, progress: 100 },
];

const highPriorityIssues = [
    { id: 1, description: "Major leak in the kitchen storage area.", reportedBy: "Jane Smith" },
    { id: 2, description: "Freezer unit temperature is above safety limits.", reportedBy: "System Alert" },
];

export default function ManagerDashboard() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Users /> Team Overview</CardTitle>
                    <CardDescription>Track the performance and task completion of your team members.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {teamMembers.map(member => (
                        <div key={member.name}>
                            <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{member.name}</span>
                                <span className="text-sm text-muted-foreground">{member.tasksCompleted} / {member.tasksCompleted + member.tasksPending} tasks</span>
                            </div>
                            <Progress value={member.progress} className="h-2" />
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card className="lg:col-span-1">
                 <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><AlertTriangle className="text-accent"/> High-Priority Issues</CardTitle>
                    <CardDescription>Critical issues that require immediate attention.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {highPriorityIssues.map(issue => (
                        <Alert key={issue.id} variant="destructive" className="bg-accent/10 border-accent text-accent [&>svg]:text-accent">
                            <Flag className="h-4 w-4" />
                            <AlertTitle className="font-bold">{issue.description}</AlertTitle>
                            <AlertDescription>
                                Reported by: {issue.reportedBy}
                            </AlertDescription>
                        </Alert>
                    ))}
                </CardContent>
            </Card>

            <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Sparkles className="text-primary"/> AI Task Recommendation</CardTitle>
                    <CardDescription>Let AI suggest the optimal tasks for your team members based on their skills and current needs.</CardDescription>
                </CardHeader>
                <CardContent>
                    <AIRecommendationForm />
                </CardContent>
            </Card>
        </div>
    );
}
