
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, CreditCard, Download } from "lucide-react";

const billingHistory = [
  { id: 'inv-001', date: 'June 1, 2024', amount: '$99.00', status: 'Paid' },
  { id: 'inv-002', date: 'July 1, 2024', amount: '$99.00', status: 'Paid' },
  { id: 'inv-003', date: 'August 1, 2024', amount: '$99.00', status: 'Pending' },
];

const planFeatures = [
  "Unlimited Locations",
  "Unlimited Team Members",
  "AI Sentinel Agent",
  "Advanced Reporting",
  "Priority Support",
];

export default function BillingPage() {
    return (
        <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Your Current Plan</CardTitle>
                        <div className="flex items-baseline gap-4 pt-2">
                            <h3 className="text-3xl font-bold">Pro Tier</h3>
                            <p className="text-2xl font-semibold text-muted-foreground">$99<span className="text-sm">/month</span></p>
                        </div>
                        <CardDescription>Your plan renews on September 1, 2024.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <h4 className="font-semibold mb-4">Your plan includes:</h4>
                        <ul className="space-y-3">
                            {planFeatures.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-primary" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                    <CardFooter className="flex flex-wrap gap-2">
                         <Button>Change Plan</Button>
                         <Button variant="outline">Cancel Subscription</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Billing History</CardTitle>
                        <CardDescription>View and download your past invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {billingHistory.map((invoice) => (
                                    <TableRow key={invoice.id}>
                                        <TableCell className="font-medium">{invoice.id}</TableCell>
                                        <TableCell>{invoice.date}</TableCell>
                                        <TableCell>{invoice.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant={invoice.status === 'Paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon">
                                                <Download className="h-4 w-4" />
                                                <span className="sr-only">Download Invoice</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><CreditCard /> Payment Method</CardTitle>
                        <CardDescription>The card that will be charged for your subscription.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between rounded-lg border bg-muted p-4">
                            <div className="flex items-center gap-3">
                                <CreditCard className="h-6 w-6" />
                                <div>
                                    <p className="font-semibold">Visa ending in 1234</p>
                                    <p className="text-xs text-muted-foreground">Expires 12/2026</p>
                                </div>
                            </div>
                            <Badge variant="outline">Primary</Badge>
                        </div>
                    </CardContent>
                     <CardFooter>
                        <Button variant="outline">Update Payment Method</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
