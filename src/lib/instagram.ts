import { supabase } from "@/integrations/supabase/client";

/**
 * Instagram Integration Helper Functions
 *
 * Provides utilities for connecting and managing Instagram Business accounts,
 * sending messages, and handling Instagram-related operations.
 */

interface ConnectInstagramChannelParams {
  name: string;
  pageId: string;
  instagramBusinessAccountId?: string;
  accessToken: string;
  verifyToken: string;
  orgId: string;
}

interface SendInstagramMessageParams {
  recipientId: string;
  message: string;
  channelId: string;
}

/**
 * Connect a new Instagram Business account as a channel
 */
export async function connectInstagramChannel(params: ConnectInstagramChannelParams) {
  const {
    name,
    pageId,
    instagramBusinessAccountId,
    accessToken,
    verifyToken,
    orgId,
  } = params;

  try {
    // Call the channel-connect Edge Function
    const { data, error } = await supabase.functions.invoke("channel-connect", {
      body: {
        channel_type: "instagram",
        name,
        credentials: {
          page_id: pageId,
          instagram_business_account_id: instagramBusinessAccountId,
          access_token: accessToken,
          verify_token: verifyToken,
        },
        org_id: orgId,
      },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error("Error connecting Instagram channel:", error);
    throw new Error(error.message || "Erro ao conectar canal do Instagram");
  }
}

/**
 * Send a message via Instagram Direct
 */
export async function sendInstagramMessage(params: SendInstagramMessageParams) {
  const { recipientId, message, channelId } = params;

  try {
    const { data, error } = await supabase.functions.invoke("instagram-send-message", {
      body: {
        recipient_id: recipientId,
        message,
        channel_id: channelId,
      },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error("Error sending Instagram message:", error);
    throw new Error(error.message || "Erro ao enviar mensagem pelo Instagram");
  }
}

/**
 * Get all Instagram channels for an organization
 */
export async function getInstagramChannels(orgId: string) {
  try {
    const { data, error } = await supabase
      .from("channel_accounts")
      .select("*")
      .eq("org_id", orgId)
      .eq("channel_type", "instagram")
      .eq("status", "active");

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error("Error fetching Instagram channels:", error);
    throw new Error(error.message || "Erro ao buscar canais do Instagram");
  }
}

/**
 * Disconnect an Instagram channel (mark as inactive)
 */
export async function disconnectInstagramChannel(channelId: string) {
  try {
    const { error } = await supabase
      .from("channel_accounts")
      .update({ status: "inactive" })
      .eq("id", channelId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error disconnecting Instagram channel:", error);
    throw new Error(error.message || "Erro ao desconectar canal do Instagram");
  }
}

/**
 * Delete an Instagram channel permanently
 */
export async function deleteInstagramChannel(channelId: string) {
  try {
    const { error } = await supabase
      .from("channel_accounts")
      .delete()
      .eq("id", channelId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting Instagram channel:", error);
    throw new Error(error.message || "Erro ao deletar canal do Instagram");
  }
}

/**
 * Extract Instagram User ID from various formats
 * Handles: @username, username, or numeric ID
 */
export function extractInstagramUserId(input: string): string {
  // Remove @ if present
  const cleaned = input.trim().replace(/^@/, "");

  // If it's a numeric ID, return as-is
  if (/^\d+$/.test(cleaned)) {
    return cleaned;
  }

  // Otherwise return the username (the API will need to resolve it)
  return cleaned;
}

/**
 * Validate Instagram Business Account ID format
 */
export function isValidInstagramAccountId(accountId: string): boolean {
  // Instagram Business Account IDs are typically 17 digits
  return /^\d{15,20}$/.test(accountId.trim());
}

/**
 * Format Instagram display name
 */
export function formatInstagramHandle(username: string): string {
  const cleaned = username.trim().replace(/^@/, "");
  return `@${cleaned}`;
}
