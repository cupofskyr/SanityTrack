
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Component, Flag, Shield, Settings, Users, Database, Bot } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline flex items-center gap-2"><Shield />Admin Control Panel</h1>
            <p className="text-muted-foreground mt-2">
                This is the master control center for the Leifur AI application. From here, you can manage system-wide configurations, view documentation, and access administrative tools.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:border-primary transition-colors">
                <Link href="/admin/features" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Flag className="text-primary"/>
                            Feature Flags
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                           Enable or disable major application features in real-time. Changes are reflected for all users instantly.
                        </p>
                    </CardContent>
                </Link>
            </Card>
            <Card className="hover:border-primary transition-colors">
                <Link href="/admin/agent-rules" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Bot className="text-primary"/>
                            AI Agent Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            View and manage the default set of rules that govern the AI's autonomous behavior.
                        </p>
                    </CardContent>
                </Link>
            </Card>
             <Card className="hover:border-primary transition-colors md:col-span-1 lg:col-span-1">
                <Link href="/admin/documentation" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="text-primary"/>
                            System Handbook
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            The official blueprint for the app's features, AI logic, and code structure.
                        </p>
                    </CardContent>
                </Link>
            </Card>
             <Card className="hover:border-primary transition-colors">
                <Link href="/admin/components" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Component className="text-primary"/>
                            UI Component Library
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                           Browse and test the available UI components used to build the application's interface.
                        </p>
                    </CardContent>
                </Link>
            </Card>
             <Card className="hover:border-primary transition-colors">
                <Link href="#" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="text-primary"/>
                            User Management
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                           View, edit, and manage all users and their assigned roles across the system. (Coming Soon)
                        </p>
                    </CardContent>
                </Link>
            </Card>
             <Card className="hover:border-primary transition-colors">
                <Link href="#" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="text-primary"/>
                            Database Explorer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                           A direct interface to browse and edit the Firestore database collections and documents. (Coming Soon)
                        </p>
                    </CardContent>
                </Link>
            </Card>
        </div>
    </div>
  )
}
