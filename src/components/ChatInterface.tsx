import { useState } from 'react';
import { Send, Bot, User, Settings } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import SettingsPage from '@/components/SettingsPage';
import TypewriterEffect from '@/components/TypewriterEffect';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const MODELS = [
  { value: "sonar(clinesp)", label: "Sonar (Clinesp)" },
  { value: "groq/moonshotai/kimi-k2-instruct", label: "Kimi K2 Instruct" },
  { value: "sonar-reasoning-pro(clinesp)", label: "Sonar Reasoning Pro" },
  { value: "sonar-reasoning(clinesp)", label: "Sonar Reasoning" },
];

const BASE_URL = "https://samuraiapi.in/v1/chat/completions";
const API_KEY = "sk-3uojvVgjgi1BMJXTRPy7J3e28HwrTat0jgncVNjcKwFdUi18";

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [animatingMessageId, setAnimatingMessageId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: 'system', content: 'You are a helpful AI assistant.' },
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: input }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.choices[0]?.message?.content || 'No response received',
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setAnimatingMessageId(assistantMessage.id);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (showSettings) {
    return <SettingsPage onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-chat-sidebar-bg border-r border-border p-4">
        <div className="flex items-center gap-3 mb-6">
          <img src={logo} alt="Sonar AI" className="w-8 h-8 rounded-full" />
          <div>
            <h1 className="text-lg font-semibold text-foreground">Sonar AI</h1>
            {user && (
              <p className="text-xs text-muted-foreground">
                {user.displayName || user.email}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Model
            </label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map(model => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => setMessages([])}
            >
              <Bot className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => setShowSettings(true)}
            >
              <Settings className="w-4 h-4 mr-2" />
              {user ? 'Account Settings' : 'Sign In'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-12">
                <img src={logo} alt="Sonar AI" className="w-16 h-16 mx-auto mb-4 opacity-50 rounded-full" />
                <h2 className="text-xl font-medium mb-2">Welcome to Sonar AI</h2>
                <p>Ask me anything, and I'll do my best to help!</p>
                {!user && (
                  <p className="text-sm mt-2">
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="text-primary hover:underline"
                    >
                      Sign in
                    </button> to save your chat history
                  </p>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
                
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-chat-user-bg text-chat-user-fg'
                      : 'bg-chat-assistant-bg text-chat-assistant-fg border border-border'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {message.role === 'assistant' && animatingMessageId === message.id ? (
                      <TypewriterEffect 
                        text={message.content} 
                        speed={20}
                        onComplete={() => setAnimatingMessageId(null)}
                      />
                    ) : (
                      message.content
                    )}
                  </div>
                  <div className="text-xs opacity-60 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div className="bg-chat-assistant-bg border border-border rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border p-4 bg-background">
          <div className="max-w-3xl mx-auto flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Message AI..."
              className="flex-1 bg-chat-input-bg"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}