import { supabase } from "@/integrations/supabase/client";

/**
 * WhatsApp Integration Helper Functions
 *
 * Provides utilities for connecting and managing WhatsApp Business accounts,
 * sending messages, and handling WhatsApp-related operations.
 */

interface ConnectWhatsAppChannelParams {
  name: string;
  phoneNumberId: string;
  businessAccountId?: string;
  accessToken: string;
  verifyToken: string;
  orgId: string;
}

interface SendWhatsAppMessageParams {
  to: string;
  message: string;
  channelId: string;
}

/**
 * Connect a new WhatsApp Business account as a channel
 */
export async function connectWhatsAppChannel(params: ConnectWhatsAppChannelParams) {
  const {
    name,
    phoneNumberId,
    businessAccountId,
    accessToken,
    verifyToken,
    orgId,
  } = params;

  try {
    // Call the channel-connect Edge Function
    const { data, error } = await supabase.functions.invoke("channel-connect", {
      body: {
        channel_type: "whatsapp",
        name,
        credentials: {
          phone_number_id: phoneNumberId,
          business_account_id: businessAccountId,
          access_token: accessToken,
          verify_token: verifyToken,
        },
        org_id: orgId,
      },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error("Error connecting WhatsApp channel:", error);
    throw new Error(error.message || "Erro ao conectar canal do WhatsApp");
  }
}

/**
 * Send a message via WhatsApp Business API
 */
export async function sendWhatsAppMessage(params: SendWhatsAppMessageParams) {
  const { to, message, channelId } = params;

  try {
    const { data, error } = await supabase.functions.invoke("whatsapp-send-message", {
      body: {
        to: formatWhatsAppNumber(to),
        message,
        channel_id: channelId,
      },
    });

    if (error) throw error;

    return data;
  } catch (error: any) {
    console.error("Error sending WhatsApp message:", error);
    throw new Error(error.message || "Erro ao enviar mensagem pelo WhatsApp");
  }
}

/**
 * Get all WhatsApp channels for an organization
 */
export async function getWhatsAppChannels(orgId: string) {
  try {
    const { data, error } = await supabase
      .from("channel_accounts")
      .select("*")
      .eq("org_id", orgId)
      .eq("channel_type", "whatsapp")
      .eq("status", "active");

    if (error) throw error;

    return data || [];
  } catch (error: any) {
    console.error("Error fetching WhatsApp channels:", error);
    throw new Error(error.message || "Erro ao buscar canais do WhatsApp");
  }
}

/**
 * Disconnect a WhatsApp channel (mark as inactive)
 */
export async function disconnectWhatsAppChannel(channelId: string) {
  try {
    const { error } = await supabase
      .from("channel_accounts")
      .update({ status: "inactive" })
      .eq("id", channelId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error disconnecting WhatsApp channel:", error);
    throw new Error(error.message || "Erro ao desconectar canal do WhatsApp");
  }
}

/**
 * Delete a WhatsApp channel permanently
 */
export async function deleteWhatsAppChannel(channelId: string) {
  try {
    const { error } = await supabase
      .from("channel_accounts")
      .delete()
      .eq("id", channelId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting WhatsApp channel:", error);
    throw new Error(error.message || "Erro ao deletar canal do WhatsApp");
  }
}

/**
 * Format phone number for WhatsApp API
 * Removes all non-numeric characters and ensures proper format
 *
 * Examples:
 * - "+55 11 98765-4321" -> "5511987654321"
 * - "(11) 98765-4321" -> "5511987654321"
 * - "11987654321" -> "5511987654321"
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, "");

  // If it starts with country code, return as-is
  // Brazilian numbers: 55 + 2-digit area code + 8-9 digit number = 12-13 digits
  if (cleaned.length >= 12) {
    return cleaned;
  }

  // If it's 11 digits (area code + number without country code), add Brazil code
  if (cleaned.length === 11) {
    return `55${cleaned}`;
  }

  // If it's 10 digits (old format), add Brazil code
  if (cleaned.length === 10) {
    return `55${cleaned}`;
  }

  // Return as-is if format is unclear (let API handle validation)
  return cleaned;
}

/**
 * Validate if a phone number looks valid for WhatsApp
 */
export function isValidWhatsAppNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");

  // Should have at least 10 digits (area code + number)
  // and at most 15 digits (E.164 format maximum)
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Format phone number for display
 * Example: "5511987654321" -> "+55 11 98765-4321"
 */
export function formatWhatsAppNumberDisplay(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  // Brazilian number format
  if (cleaned.startsWith("55") && cleaned.length >= 12) {
    const countryCode = cleaned.substring(0, 2);
    const areaCode = cleaned.substring(2, 4);
    const number = cleaned.substring(4);

    if (number.length === 9) {
      // Mobile with 9 digits: 98765-4321
      return `+${countryCode} ${areaCode} ${number.substring(0, 5)}-${number.substring(5)}`;
    } else if (number.length === 8) {
      // Landline with 8 digits: 8765-4321
      return `+${countryCode} ${areaCode} ${number.substring(0, 4)}-${number.substring(4)}`;
    }
  }

  // Generic international format
  if (cleaned.length > 10) {
    return `+${cleaned}`;
  }

  return phone;
}
