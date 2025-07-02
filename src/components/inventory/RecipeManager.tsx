
"use client";

import { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, Utensils, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantityRequired: number;
}

interface Recipe {
  id: string;
  recipeName: string;
  menuItemId: string;
  version: number;
  isActive: boolean;
}

export default function RecipeManager() {
  const [allIngredients, setAllIngredients] = useState<Ingredient[]>([]);
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newRecipeName, setNewRecipeName] = useState('');
  const [newMenuItemId, setNewMenuItemId] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<RecipeIngredient[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    setLoading(true);
    const unsubIngredients = onSnapshot(collection(db, "ingredients"), (snapshot) => {
      const ingredientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient));
      setAllIngredients(ingredientsData);
      setLoading(false);
    });
    const unsubRecipes = onSnapshot(collection(db, "recipes"), (snapshot) => {
      const recipesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      setAllRecipes(recipesData);
    });
    return () => {
      unsubIngredients();
      unsubRecipes();
    };
  }, []);

  const handleAddIngredientToRecipe = (ingredient: Ingredient) => {
    if (selectedIngredients.find(i => i.ingredientId === ingredient.id)) return;
    const newRecipeIngredient: RecipeIngredient = {
      ingredientId: ingredient.id,
      ingredientName: ingredient.name,
      quantityRequired: 1,
    };
    setSelectedIngredients([...selectedIngredients, newRecipeIngredient]);
  };

  const handleUpdateQuantity = (ingredientId: string, quantity: number) => {
    const newQty = isNaN(quantity) || quantity < 0 ? 0 : quantity;
    setSelectedIngredients(currentIngredients =>
      currentIngredients.map(ing =>
        ing.ingredientId === ingredientId ? { ...ing, quantityRequired: newQty } : ing
      )
    );
  };

  const handleRemoveIngredientFromRecipe = (ingredientId: string) => {
    setSelectedIngredients(currentIngredients =>
      currentIngredients.filter(ing => ing.ingredientId !== ingredientId)
    );
  };

  const handleSaveRecipe = async () => {
    if (!newRecipeName || !newMenuItemId || selectedIngredients.length === 0) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all fields and add at least one ingredient.",
      });
      return;
    }
    await addDoc(collection(db, "recipes"), {
      recipeName: newRecipeName,
      menuItemId: newMenuItemId,
      version: 1,
      isActive: true,
      ingredients: selectedIngredients,
      createdAt: serverTimestamp(),
    });

    setNewRecipeName('');
    setNewMenuItemId('');
    setSelectedIngredients([]);
    toast({
      title: "Recipe Saved!",
      description: `"${newRecipeName}" has been added to your recipe book.`,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Ingredients</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto pr-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="text-right">Add</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allIngredients.map(ing => (
                    <TableRow key={ing.id}>
                      <TableCell className="font-medium">{ing.name} <span className="text-xs text-muted-foreground">({ing.unit})</span></TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => handleAddIngredientToRecipe(ing)}>
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Utensils /> Create New Recipe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipe-name">Recipe Name</Label>
              <Input id="recipe-name" placeholder="e.g., Large Strawberry Smoothie" value={newRecipeName} onChange={e => setNewRecipeName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menu-item-id">Menu Item ID / SKU</Label>
              <Input id="menu-item-id" placeholder="e.g., strawberry-smoothie-large" value={newMenuItemId} onChange={e => setNewMenuItemId(e.target.value)} />
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Ingredients in this Recipe:</h4>
            {selectedIngredients.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg">
                Add ingredients from the list on the left.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedIngredients.map(ing => (
                  <div key={ing.ingredientId} className="flex items-center gap-3 bg-muted p-2 rounded-md">
                    <span className="flex-1 font-medium">{ing.ingredientName}</span>
                    <Input type="number" value={ing.quantityRequired} onChange={e => handleUpdateQuantity(ing.ingredientId, parseFloat(e.target.value))} className="w-24 p-1 h-8" />
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => handleRemoveIngredientFromRecipe(ing.ingredientId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button onClick={handleSaveRecipe} className="w-full">Save Recipe</Button>
        </CardContent>
      </Card>

       <Card className="lg:col-span-3">
        <CardHeader>
            <CardTitle>Existing Recipes</CardTitle>
            <CardDescription>A list of all recipes currently in your system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recipe Name</TableHead>
                  <TableHead>Menu Item ID</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allRecipes.map(recipe => (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">{recipe.recipeName}</TableCell>
                    <TableCell>{recipe.menuItemId}</TableCell>
                    <TableCell>{recipe.version}</TableCell>
                    <TableCell>{recipe.isActive ? 'Active' : 'Inactive'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
