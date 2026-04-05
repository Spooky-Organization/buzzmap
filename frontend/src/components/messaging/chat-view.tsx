'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { Field } from '@/components/ui/field';
import { MessageBubble } from './message-bubble';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

interface ChatViewProps {
  messages: Message[];
  currentUserId: string;
  isTyping?: boolean;
  isSending?: boolean;
  onSend: (content: string) => void;
}

export function ChatView({
  messages,
  currentUserId,
  isTyping = false,
  isSending = false,
  onSend,
}: ChatViewProps) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    const content = input.trim();
    if (!content || isSending) return;
    onSend(content);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-2">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              timestamp={msg.createdAt}
              isOwn={msg.senderId === currentUserId}
              isRead={msg.isRead}
            />
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-3" />
              <span>Typing...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-3">
        <Field>
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSending}
              className="flex-1"
            />
            <Button
              size="icon"
              disabled={isSending || !input.trim()}
              onClick={handleSend}
            >
              {isSending ? <Spinner data-icon="inline-start" /> : <Send />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </Field>
      </div>
    </div>
  );
}
