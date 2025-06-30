
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarSeparator, MenubarTrigger } from "@/components/ui/menubar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, ChevronDown } from "lucide-react";

export default function ComponentsPage() {
  return (
    <TooltipProvider>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold font-headline">UI Component Library</h1>
        <p className="text-muted-foreground">
          This page showcases the available ShadCN UI components for building interfaces.
        </p>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>
        
        {/* Inputs & Forms */}
        <Card>
          <CardHeader>
            <CardTitle>Forms & Inputs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" placeholder="Email" />
            </div>
            <div className="grid w-full gap-1.5">
              <Label htmlFor="message">Your message</Label>
              <Textarea placeholder="Type your message here." id="message" />
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="terms" />
                <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Accept terms and conditions
                </label>
            </div>
            <RadioGroup defaultValue="comfortable">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="default" id="r1" />
                <Label htmlFor="r1">Default</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="comfortable" id="r2" />
                <Label htmlFor="r2">Comfortable</Label>
              </div>
            </RadioGroup>
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
                <Switch id="airplane-mode" />
                <Label htmlFor="airplane-mode">Airplane Mode</Label>
            </div>
             <Slider defaultValue={[50]} max={100} step={1} />
          </CardContent>
        </Card>

        {/* Overlays & Popups */}
        <Card>
          <CardHeader>
            <CardTitle>Overlays & Popups</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <AlertDialog>
                <AlertDialogTrigger asChild><Button variant="outline">Alert Dialog</Button></AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                    <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction>Continue</AlertDialogAction></AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog>
                <DialogTrigger asChild><Button>Dialog</Button></DialogTrigger>
                <DialogContent>
                    <DialogHeader><DialogTitle>Dialog Title</DialogTitle><DialogDescription>This is a dialog description.</DialogDescription></DialogHeader>
                    <p>Dialog content goes here.</p>
                    <DialogFooter><Button>Save</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Dropdown <ChevronDown className="ml-2"/></Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <Popover>
                <PopoverTrigger asChild><Button variant="outline">Popover</Button></PopoverTrigger>
                <PopoverContent><p>This is the popover content.</p></PopoverContent>
            </Popover>
             <Tooltip>
                <TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger>
                <TooltipContent><p>This is a tooltip.</p></TooltipContent>
            </Tooltip>
          </CardContent>
        </Card>
        
        {/* Data Display */}
        <Card>
            <CardHeader><CardTitle>Data Display</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                        <AccordionTrigger>Is it accessible?</AccordionTrigger>
                        <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="flex gap-4">
                    <Avatar><AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="user avatar" /><AvatarFallback>CN</AvatarFallback></Avatar>
                    <Badge>Default Badge</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                </div>
                 <Progress value={33} />
            </CardContent>
        </Card>
        
         {/* Navigation */}
        <Card>
            <CardHeader><CardTitle>Navigation</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                 <Menubar>
                    <MenubarMenu>
                        <MenubarTrigger>File</MenubarTrigger>
                        <MenubarContent>
                            <MenubarItem>New</MenubarItem>
                            <MenubarItem>Open</MenubarItem>
                            <MenubarSeparator />
                            <MenubarItem>Save</MenubarItem>
                        </MenubarContent>
                    </MenubarMenu>
                </Menubar>
                <Tabs defaultValue="account" className="w-[400px]">
                    <TabsList><TabsTrigger value="account">Account</TabsTrigger><TabsTrigger value="password">Password</TabsTrigger></TabsList>
                    <TabsContent value="account">Account settings go here.</TabsContent>
                    <TabsContent value="password">Password settings go here.</TabsContent>
                </Tabs>
            </CardContent>
        </Card>

        {/* Miscellaneous */}
        <Card>
            <CardHeader><CardTitle>Miscellaneous</CardTitle></CardHeader>
            <CardContent className="space-y-6">
                <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>Heads up!</AlertTitle><AlertDescription>This is an alert component.</AlertDescription></Alert>
                <div>
                    <p className="mb-2">This is some text.</p>
                    <Separator />
                    <p className="mt-2">This is more text.</p>
                </div>
            </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
}
