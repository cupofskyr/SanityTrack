
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, DollarSign, ShoppingCart, MessageSquare } from 'lucide-react';
import { suggestOrderAction, optimizeOrderAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';

// MOCK DATA - In a real app, this would come from Firestore
const initialInventory = [
  { id: 'item-1', itemName: 'Ground Beef', currentStock: 8, reorderThreshold: 10, avgDailyUsage: 4, unit: 'lbs' },
  { id: 'item-2', itemName: 'Romaine Lettuce', currentStock: 5, reorderThreshold: 8, avgDailyUsage: 3, unit: 'heads' },
  { id: 'item-3', itemName: 'Takeout Containers', currentStock: 50, reorderThreshold: 100, avgDailyUsage: 25, unit: 'units' },
  { id: 'item-4', itemName: 'Avocados', currentStock: 10, reorderThreshold: 20, avgDailyUsage: 8, unit: 'each' },
  { id: 'item-5', itemName: 'Ketchup', currentStock: 1, reorderThreshold: 2, avgDailyUsage: 0.5, unit: 'gallon' },
];

type OrderListItem = {
    id: string;
    itemName: string;
    currentStock: number;
    reorderThreshold: number;
    avgDailyUsage: number;
    unit: string;
    orderQty: number;
    notes: string;
    bestSupplier?: string | null;
    unitPrice?: number | null;
    totalPrice?: number | null;
};

export default function MicroOrderingTool() {
    const { toast } = useToast();
    const [orderList, setOrderList] = useState<OrderListItem[]>([]);
    const [deliveryBufferDays, setDeliveryBufferDays] = useState(3);
    const [isLoading, setIsLoading] = useState(false);
    const [chatMessages, setChatMessages] = useState<{from: 'bot' | 'user', text: string}[]>([
        { from: "bot", text: "Hi! I'm your ordering assistant. Click 'Suggest My Order' and I'll draft a shopping list based on sales trends and inventory levels." }
    ]);
    const [inputMessage, setInputMessage] = useState("");

    // Initialize order list from mock inventory
    useEffect(() => {
        const initialOrders = initialInventory.map((item) => {
            const expectedUsage = item.avgDailyUsage * deliveryBufferDays;
            const suggestedQty = Math.max(0, Math.ceil((item.reorderThreshold + expectedUsage) - item.currentStock));
            return {
                ...item,
                orderQty: suggestedQty,
                notes: "",
            };
        }).filter(item => item.orderQty > 0);
        setOrderList(initialOrders);
    }, [deliveryBufferDays]);

    const updateOrderQty = (itemName: string, value: string) => {
        const qty = Math.max(0, Number(value));
        setOrderList(list => list.map(item => item.itemName === itemName ? { ...item, orderQty: qty } : item));
    };

    const handleSuggestOrder = async () => {
        setIsLoading(true);
        addChatMessage("user", "Suggest my order based on current inventory and usage.");
        
        try {
            const inventoryForAI = initialInventory.map(({ itemName, currentStock, reorderThreshold, avgDailyUsage }) => ({
                itemName, currentStock, reorderThreshold, avgDailyUsage
            }));
            const result = await suggestOrderAction({ inventory: inventoryForAI, deliveryBufferDays });
            
            if (result.error || !result.data) throw new Error(result.error || "Failed to get suggestions.");
            
            setOrderList(currentList => {
                const newList = [...currentList];
                result.data!.suggestions.forEach(suggestion => {
                    const itemIndex = newList.findIndex(item => item.itemName === suggestion.itemName);
                    if (itemIndex > -1) {
                        newList[itemIndex].orderQty = suggestion.suggestedQty;
                    }
                });
                return newList;
            });
            addChatMessage("bot", `${result.data.reasoning} I've updated your list to reflect this.`);

        } catch (error: any) {
            addChatMessage("bot", `Sorry, I couldn't generate suggestions. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const addChatMessage = (from: 'user' | 'bot', text: string) => {
        setChatMessages(msgs => [...msgs, { from, text }]);
    };
    
    const handleChatSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;
        addChatMessage("user", inputMessage);
        // Mock response
        setTimeout(() => {
            addChatMessage("bot", `I'm an ordering assistant. You can ask me to suggest an order or optimize prices.`);
        }, 1000);
        setInputMessage("");
    };

    const optimizePrices = async () => {
        const itemsToOptimize = orderList
            .filter(item => item.orderQty > 0)
            .map(item => ({ name: item.itemName, quantity: `${item.orderQty} ${item.unit}`}));

        if (itemsToOptimize.length === 0) {
            toast({ variant: 'destructive', title: 'No items to optimize.' });
            return;
        }

        setIsLoading(true);
        addChatMessage('user', 'Optimize prices for my current list.');
        try {
            const result = await optimizeOrderAction({ shoppingList: itemsToOptimize });
            if (result.error || !result.data) throw new Error(result.error || 'Failed to optimize.');

            addChatMessage('bot', `Order optimized! ${result.data.reasoning} You'll save around $${result.data.totalSavings.toFixed(2)}.`);
            setOrderList(currentList => {
                const updatedList = [...currentList];
                result.data!.recommendation.forEach(supplierOrder => {
                    supplierOrder.items.forEach(optimizedItem => {
                        const itemIndex = updatedList.findIndex(item => item.itemName === optimizedItem.name);
                        if (itemIndex > -1) {
                            updatedList[itemIndex].bestSupplier = supplierOrder.supplierName;
                            updatedList[itemIndex].unitPrice = optimizedItem.totalPrice / updatedList[itemIndex].orderQty;
                            updatedList[itemIndex].totalPrice = optimizedItem.totalPrice;
                        }
                    });
                });
                return updatedList;
            });

        } catch(error: any) {
             addChatMessage("bot", `Sorry, I couldn't optimize prices. Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const generatePurchaseOrder = () => {
        addChatMessage("bot", "Purchase order generated and saved to your records.");
        toast({ title: "Purchase Order Generated (Simulated)" });
    };

    const totalCost = orderList.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const urgentAlerts = orderList.filter(item => item.currentStock < item.reorderThreshold / 2);

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                           <ShoppingCart /> Smart Micro-Ordering
                        </CardTitle>
                        <CardDescription>
                            Review suggested order quantities and optimize your purchasing across suppliers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                         {urgentAlerts.length > 0 && (
                            <Alert variant="destructive" className="mb-4">
                                <AlertTitle>Urgent Alert!</AlertTitle>
                                <AlertDescription>
                                    Critically low stock on: {urgentAlerts.map((item) => item.itemName).join(", ")}
                                </AlertDescription>
                            </Alert>
                        )}
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Order Qty</TableHead>
                                    <TableHead>Supplier</TableHead>
                                    <TableHead className="text-right">Total Price</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orderList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.itemName}</TableCell>
                                        <TableCell>{item.currentStock} / {item.reorderThreshold}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min={0}
                                                value={item.orderQty}
                                                onChange={(e) => updateOrderQty(item.itemName, e.target.value)}
                                                className="w-20"
                                            />
                                        </TableCell>
                                        <TableCell>{item.bestSupplier || '-'}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {item.totalPrice != null ? `$${item.totalPrice.toFixed(2)}` : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter className="flex-wrap gap-2">
                         <div className="flex-1 min-w-full sm:min-w-0">
                            <strong>Total Estimated Cost: </strong> 
                            <span className="text-lg font-bold text-primary">${totalCost.toFixed(2)}</span>
                         </div>
                         <Button onClick={generatePurchaseOrder} disabled={!orderList.length}>
                            Generate Purchase Order
                         </Button>
                    </CardFooter>
                </Card>
            </div>

            <Card className="flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" /> Ordering Assistant
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1 pr-4 mb-4">
                        <div className="space-y-4 text-sm">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={cn("flex items-start gap-3", msg.from === 'user' && 'justify-end')}>
                                    {msg.from === 'bot' && (
                                        <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                                            <AvatarFallback>AI</AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div className={cn("p-3 rounded-lg max-w-[85%]", msg.from === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                                        <p>{msg.text}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex items-start gap-3">
                                    <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                    <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin"/>
                                        <span className="text-sm text-muted-foreground italic">Assistant is thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="pt-4 border-t space-y-2">
                         <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={handleSuggestOrder} disabled={isLoading}>Suggest Order</Button>
                            <Button variant="outline" size="sm" onClick={optimizePrices} disabled={isLoading}>Optimize Prices</Button>
                         </div>
                         <form onSubmit={handleChatSubmit} className="flex gap-2">
                             <Input
                                placeholder="Ask a question..."
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                required
                            />
                            <Button type="submit">Send</Button>
                         </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
