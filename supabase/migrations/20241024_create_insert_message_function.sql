-- Criar função RPC para inserir mensagens
CREATE OR REPLACE FUNCTION insert_message(
  p_conversation_id UUID,
  p_sender_type TEXT,
  p_direction TEXT,
  p_content TEXT,
  p_message_type TEXT,
  p_media_url TEXT,
  p_channel_type TEXT,
  p_status TEXT,
  p_external_id TEXT,
  p_metadata TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  message_id UUID;
BEGIN
  -- Inserir mensagem
  INSERT INTO public.messages (
    conversation_id,
    sender_type,
    direction,
    content,
    message_type,
    media_url,
    channel_type,
    status,
    external_id,
    metadata
  ) VALUES (
    p_conversation_id,
    p_sender_type,
    p_direction,
    p_content,
    p_message_type,
    p_media_url,
    p_channel_type,
    p_status,
    p_external_id,
    p_metadata::jsonb
  ) RETURNING id INTO message_id;
  
  RETURN message_id;
END;
$$;

-- Garantir que a função seja executável por usuários autenticados
GRANT EXECUTE ON FUNCTION insert_message TO authenticated;
