import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search } from "lucide-react";

export default function Inbox() {
  return (
    <div className="flex h-screen">
      {/* Conversation List */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar conversas..." className="pl-10" />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b hover:bg-accent cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">Cliente #{i}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Última mensagem aqui...
                  </p>
                </div>
                <span className="text-xs text-muted-foreground">10:30</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b bg-card">
          <h2 className="font-semibold">Cliente #1</h2>
          <p className="text-sm text-muted-foreground">WhatsApp • Online</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-lg p-3 ${
                i % 2 === 0 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              }`}>
                <p className="text-sm">Mensagem de exemplo #{i}</p>
                <p className="text-xs opacity-70 mt-1">10:3{i}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input placeholder="Digite sua mensagem..." className="flex-1" />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}