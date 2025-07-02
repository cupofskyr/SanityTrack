
"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const tasks = {
  todo: [
    { id: 1, title: "Clean kitchen floor", priority: "High", assignee: "JD" },
    { id: 2, title: "Restock restroom supplies", priority: "Medium", assignee: "SS" },
  ],
  inProgress: [
    { id: 3, title: "Sanitize all door handles", priority: "High", assignee: "JD" },
    { id: 4, title: "Deep clean freezer unit", priority: "Medium", assignee: "SW" },
  ],
  done: [
    { id: 5, title: "Empty trash bins", priority: "Low", assignee: "SS" },
    { id: 6, title: "Wipe down dining tables", priority: "Medium", assignee: "JD" },
    { id: 7, title: "Inspect fire extinguishers", priority: "High", assignee: "SW" },
  ],
};

const TaskCard = ({ task }: { task: { id: number; title: string; priority: string; assignee: string } }) => (
  <Card className="mb-4 transition-shadow hover:shadow-lg">
    <CardContent className="p-4">
      <p className="font-semibold mb-2">{task.title}</p>
      <div className="flex justify-between items-center">
        <Badge variant={task.priority === 'High' ? 'destructive' : 'secondary'}>{task.priority}</Badge>
        <Avatar className="h-6 w-6">
          <AvatarImage src={`https://placehold.co/40x40.png?text=${task.assignee}`} data-ai-hint="user avatar" />
          <AvatarFallback>{task.assignee}</AvatarFallback>
        </Avatar>
      </div>
    </CardContent>
  </Card>
);

export default function TaskboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="font-headline text-lg">To Do</CardTitle>
          <CardDescription>{tasks.todo.length} tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.todo.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="font-headline text-lg">In Progress</CardTitle>
          <CardDescription>{tasks.inProgress.length} tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.inProgress.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Done</CardTitle>
          <CardDescription>{tasks.done.length} tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.done.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
