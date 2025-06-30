
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Component, Flag, BrainCircuit } from 'lucide-react'
import Link from 'next/link'

export default function DevToolsPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold font-headline">Developer & Admin Console</h1>
            <p className="text-muted-foreground">
                This is the central hub for system documentation, component references, and administrative tools.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:border-primary transition-colors">
                <Link href="/dev-tools/documentation" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="text-primary"/>
                            System Documentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            View the complete guide to the application, its features, user roles, and the underlying AI engine.
                        </p>
                    </CardContent>
                </Link>
            </Card>
             <Card className="hover:border-primary transition-colors">
                <Link href="/dev-tools/components" className="block h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Component className="text-primary"/>
                            UI Component Library
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                           Browse and test the available ShadCN UI components used to build the application's interface.
                        </p>
                    </CardContent>
                </Link>
            </Card>
             <Card className="hover:border-primary transition-colors">
                <Link href="/dev-tools/features" className="block h-full">
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
        </div>
    </div>
  )
}
