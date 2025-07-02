
"use client"

import { useState, useRef, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bot, User, Send, Loader2 } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

type Message = {
  role: 'user' | 'bot'
  content: string
}

export default function ChatAgentTester() {
  const [input, setInput] = useState('')
  const [chatLog, setChatLog] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [chatLog]);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return
    setLoading(true)

    const userMsg: Message = { role: "user", content: input.trim() }
    setChatLog(prev => [...prev, userMsg])
    setInput('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      // const res = await axios.post("/api/ai/agent-chat", { prompt: userMsg.content })
      const botResponse = `This is a simulated response to: "${userMsg.content}"`
      
      setChatLog(prev => [...prev, { role: "bot", content: botResponse }])
    } catch {
       setChatLog(prev => [...prev, { role: "bot", content: "❌ Error: Could not get response." }])
    }
    setLoading(false)
  }

  return (
    <Card className="max-w-xl">
      <CardHeader>
        <CardTitle>💬 Chat Agent Tester</CardTitle>
        <CardDescription>Test the conversational capabilities of your AI agent.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col h-[60vh]">
          <ScrollArea className="flex-1 pr-4 mb-4" ref={scrollAreaRef as any}>
            <div className="space-y-4">
                {chatLog.length === 0 && <p className="text-muted-foreground text-center">No messages yet. Start the conversation!</p>}
                {chatLog.map((message, index) => (
                    <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                        {message.role === 'bot' && (
                            <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                                <AvatarFallback><Bot size={16} /></AvatarFallback>
                            </Avatar>
                        )}
                        <div className={cn("p-3 rounded-lg max-w-[80%]", message.role === 'bot' ? 'bg-muted' : 'bg-primary text-primary-foreground')}>
                            <p className="text-sm">{message.content}</p>
                        </div>
                            {message.role === 'user' && (
                            <Avatar className="w-8 h-8">
                                <AvatarFallback><User size={16} /></AvatarFallback>
                            </Avatar>
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="flex items-start gap-3">
                         <Avatar className="w-8 h-8 bg-primary text-primary-foreground">
                            <AvatarFallback><Bot size={16} /></AvatarFallback>
                        </Avatar>
                        <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin"/>
                            <span className="text-sm text-muted-foreground italic">Agent is thinking...</span>
                        </div>
                    </div>
                )}
            </div>
          </ScrollArea>
           <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t">
              <Textarea
                rows={1}
                className="resize-none"
                placeholder="Type your message..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage(e);
                    }
                }}
              />
              <Button type="submit" disabled={loading} size="icon">
                <Send className="h-4 w-4" />
              </Button>
          </form>
      </CardContent>
    </Card>
  )
}
