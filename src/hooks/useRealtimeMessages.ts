import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Real-time Messages Hook
 *
 * Subscribe to new messages via Supabase Realtime
 * Automatically updates UI when messages arrive across all channel types
 * (WhatsApp, Instagram, Telegram, Messenger)
 */

interface Message {
  id: string;
  conversation_id: string;
  body: string;
  direction: "inbound" | "outbound";
  created_at: string;
  read_at: string | null;
  sent_at: string | null;
  delivered_at: string | null;
  error_code: string | null;
  media_url: string | null;
  org_id: string;
}

interface UseRealtimeMessagesOptions {
  conversationId?: string;
  orgId?: string;
  enabled?: boolean;
}

interface UseRealtimeMessagesReturn {
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  error: Error | null;
}

export function useRealtimeMessages(
  options: UseRealtimeMessagesOptions = {}
): UseRealtimeMessagesReturn {
  const { conversationId, orgId, enabled = true } = options;

  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    const setupRealtimeSubscription = async () => {
      try {
        // Fetch initial messages
        let query = supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (conversationId) {
          query = query.eq("conversation_id", conversationId);
        }

        if (orgId) {
          query = query.eq("org_id", orgId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setMessages(data || []);

        // Calculate unread count
        const unread = (data || []).filter(
          (msg) => msg.direction === "inbound" && !msg.read_at
        ).length;
        setUnreadCount(unread);

        setLoading(false);

        // Setup realtime subscription
        const channelName = conversationId
          ? `messages:conversation:${conversationId}`
          : orgId
          ? `messages:org:${orgId}`
          : "messages:all";

        channel = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "messages",
              filter: conversationId
                ? `conversation_id=eq.${conversationId}`
                : orgId
                ? `org_id=eq.${orgId}`
                : undefined,
            },
            (payload) => {
              const newMessage = payload.new as Message;

              setMessages((prev) => {
                // Avoid duplicates
                if (prev.some((msg) => msg.id === newMessage.id)) {
                  return prev;
                }
                return [...prev, newMessage];
              });

              // Update unread count if it's an inbound message
              if (newMessage.direction === "inbound" && !newMessage.read_at) {
                setUnreadCount((prev) => prev + 1);
              }
            }
          )
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "messages",
              filter: conversationId
                ? `conversation_id=eq.${conversationId}`
                : orgId
                ? `org_id=eq.${orgId}`
                : undefined,
            },
            (payload) => {
              const updatedMessage = payload.new as Message;

              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === updatedMessage.id ? updatedMessage : msg
                )
              );

              // Recalculate unread count
              setUnreadCount((prev) => {
                const oldMessage = payload.old as Partial<Message>;
                const wasUnread = oldMessage?.direction === "inbound" && !oldMessage?.read_at;
                const isUnread =
                  updatedMessage.direction === "inbound" && !updatedMessage.read_at;

                if (wasUnread && !isUnread) return Math.max(0, prev - 1);
                if (!wasUnread && isUnread) return prev + 1;
                return prev;
              });
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Error setting up realtime subscription:", err);
        setError(err as Error);
        setLoading(false);
      }
    };

    setupRealtimeSubscription();

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [conversationId, orgId, enabled]);

  return {
    messages,
    unreadCount,
    loading,
    error,
  };
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) {
    console.error("Error marking message as read:", error);
    throw error;
  }
}

/**
 * Mark all messages in a conversation as read
 */
export async function markConversationAsRead(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("direction", "inbound")
    .is("read_at", null);

  if (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
}
