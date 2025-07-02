
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import IngredientsManager from "./IngredientsManager";
import RecipeManager from "./RecipeManager";

export default function InventoryDashboard() {
    return (
        <Tabs defaultValue="ingredients" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="recipes">Recipes</TabsTrigger>
            </TabsList>
            <TabsContent value="ingredients">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Ingredients</CardTitle>
                        <CardDescription>
                            Manage your raw ingredients, set par levels, and track stock.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <IngredientsManager />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="recipes">
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Recipes</CardTitle>
                        <CardDescription>
                            Create and manage recipes to link menu items to your inventory for automated stock deduction.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <RecipeManager />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
