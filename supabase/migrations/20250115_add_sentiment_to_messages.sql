-- ============================================
-- MIGRATION: Adicionar Sentiment Analysis às Mensagens
-- Data: 2025-01-15
-- Descrição: Adiciona campos para armazenar análise de sentimento
-- ============================================

-- Adicionar colunas de sentimento à tabela messages
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
ADD COLUMN IF NOT EXISTS sentiment_confidence DECIMAL(3,2) CHECK (sentiment_confidence >= 0 AND sentiment_confidence <= 1),
ADD COLUMN IF NOT EXISTS sentiment_emotions TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS analyzed_at TIMESTAMP WITH TIME ZONE;

-- Criar índice para consultas de sentimento
CREATE INDEX IF NOT EXISTS idx_messages_sentiment ON messages(sentiment) WHERE sentiment IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_sentiment_score ON messages(sentiment_score) WHERE sentiment_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_analyzed_at ON messages(analyzed_at) WHERE analyzed_at IS NOT NULL;

-- ============================================
-- TABELA: ai_fallback_config
-- Descrição: Configurações de fallback automático por agente
-- ============================================
CREATE TABLE IF NOT EXISTS ai_fallback_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES ai_agents(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Configurações de gatilhos
  enabled BOOLEAN DEFAULT true,
  sentiment_threshold DECIMAL(3,2) DEFAULT -0.5, -- Score abaixo deste valor dispara fallback
  consecutive_negative_messages INTEGER DEFAULT 2, -- Número de mensagens negativas seguidas
  keywords_trigger TEXT[] DEFAULT '{}', -- Palavras-chave que disparam fallback

  -- Configurações de ação
  auto_assign_to_attendant BOOLEAN DEFAULT true,
  notify_attendant BOOLEAN DEFAULT true,
  notify_supervisor BOOLEAN DEFAULT false,
  fallback_message TEXT, -- Mensagem enviada ao cliente durante transferência

  -- Prioridade de atendimento após fallback
  escalation_priority VARCHAR(20) DEFAULT 'high' CHECK (escalation_priority IN ('low', 'medium', 'high', 'urgent')),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(agent_id, org_id)
);

-- RLS para ai_fallback_config
ALTER TABLE ai_fallback_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fallback config of their org"
  ON ai_fallback_config FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage fallback config"
  ON ai_fallback_config FOR ALL
  USING (
    org_id IN (
      SELECT org_id FROM members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- TABELA: ai_fallback_logs
-- Descrição: Log de todos os fallbacks executados
-- ============================================
CREATE TABLE IF NOT EXISTS ai_fallback_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Motivo do fallback
  trigger_type VARCHAR(50), -- 'negative_sentiment', 'keywords', 'consecutive_negative', 'manual'
  trigger_value JSONB, -- Detalhes do gatilho (sentiment_score, keywords encontradas, etc)

  -- Contexto
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  sentiment_at_trigger VARCHAR(20),
  sentiment_score_at_trigger DECIMAL(3,2),

  -- Ação tomada
  assigned_to_attendant_id UUID REFERENCES attendants(id) ON DELETE SET NULL,
  notification_sent BOOLEAN DEFAULT false,
  fallback_message_sent BOOLEAN DEFAULT false,

  -- Resultado
  resolved_by VARCHAR(20), -- 'attendant', 'supervisor', 'timeout', 'closed'
  resolution_time_minutes INTEGER,
  customer_satisfaction INTEGER CHECK (customer_satisfaction >= 1 AND customer_satisfaction <= 5),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Índices para fallback_logs
CREATE INDEX IF NOT EXISTS idx_fallback_logs_conversation ON ai_fallback_logs(conversation_id);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_agent ON ai_fallback_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_org ON ai_fallback_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_created ON ai_fallback_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fallback_logs_trigger_type ON ai_fallback_logs(trigger_type);

-- RLS para ai_fallback_logs
ALTER TABLE ai_fallback_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view fallback logs of their org"
  ON ai_fallback_logs FOR SELECT
  USING (
    org_id IN (
      SELECT org_id FROM members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert fallback logs"
  ON ai_fallback_logs FOR INSERT
  WITH CHECK (true); -- Permitir Edge Functions inserir

-- ============================================
-- VIEW: sentiment_summary
-- Descrição: Resumo de sentimentos por conversa
-- ============================================
CREATE OR REPLACE VIEW sentiment_summary AS
SELECT
  m.conversation_id,
  m.org_id,
  COUNT(*) as total_messages,
  COUNT(*) FILTER (WHERE sentiment = 'positive') as positive_count,
  COUNT(*) FILTER (WHERE sentiment = 'neutral') as neutral_count,
  COUNT(*) FILTER (WHERE sentiment = 'negative') as negative_count,
  AVG(sentiment_score) as avg_sentiment_score,
  MIN(sentiment_score) as min_sentiment_score,
  MAX(sentiment_score) as max_sentiment_score,
  ARRAY_AGG(DISTINCT unnest(sentiment_emotions)) FILTER (WHERE sentiment_emotions IS NOT NULL) as all_emotions,
  MAX(analyzed_at) as last_analyzed_at
FROM messages m
WHERE sentiment IS NOT NULL
GROUP BY m.conversation_id, m.org_id;

-- ============================================
-- FUNCTION: get_conversation_sentiment_trend
-- Descrição: Retorna tendência de sentimento de uma conversa
-- ============================================
CREATE OR REPLACE FUNCTION get_conversation_sentiment_trend(p_conversation_id UUID)
RETURNS TABLE (
  message_created_at TIMESTAMP WITH TIME ZONE,
  sentiment VARCHAR(20),
  sentiment_score DECIMAL(3,2),
  is_trending_negative BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_messages AS (
    SELECT
      created_at,
      sentiment,
      sentiment_score,
      ROW_NUMBER() OVER (ORDER BY created_at DESC) as rn,
      AVG(sentiment_score) OVER (
        ORDER BY created_at DESC
        ROWS BETWEEN CURRENT ROW AND 2 FOLLOWING
      ) as avg_last_3
    FROM messages
    WHERE conversation_id = p_conversation_id
      AND sentiment IS NOT NULL
      AND direction = 'inbound' -- Apenas mensagens do cliente
    ORDER BY created_at DESC
    LIMIT 20
  )
  SELECT
    created_at,
    sentiment,
    sentiment_score,
    (avg_last_3 < -0.3) as is_trending_negative
  FROM ranked_messages
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCTION: trigger_fallback_if_needed
-- Descrição: Função para verificar se fallback deve ser acionado
-- ============================================
CREATE OR REPLACE FUNCTION trigger_fallback_if_needed(
  p_message_id UUID,
  p_conversation_id UUID,
  p_sentiment VARCHAR(20),
  p_sentiment_score DECIMAL(3,2)
)
RETURNS JSONB AS $$
DECLARE
  v_agent_id UUID;
  v_org_id UUID;
  v_config RECORD;
  v_should_fallback BOOLEAN := false;
  v_trigger_type VARCHAR(50);
  v_trigger_value JSONB;
  v_consecutive_negative INTEGER;
BEGIN
  -- Buscar agente e org da conversa
  SELECT ac.agent_id, c.org_id INTO v_agent_id, v_org_id
  FROM conversations c
  LEFT JOIN agent_conversations ac ON ac.id = c.id
  WHERE c.id = p_conversation_id;

  -- Se não tem agente atribuído, não fazer fallback
  IF v_agent_id IS NULL THEN
    RETURN jsonb_build_object('should_fallback', false, 'reason', 'no_agent');
  END IF;

  -- Buscar configuração de fallback
  SELECT * INTO v_config
  FROM ai_fallback_config
  WHERE agent_id = v_agent_id AND org_id = v_org_id AND enabled = true;

  -- Se não tem config ou está desabilitado, não fazer fallback
  IF v_config IS NULL THEN
    RETURN jsonb_build_object('should_fallback', false, 'reason', 'no_config');
  END IF;

  -- VERIFICAR GATILHO 1: Sentiment Score abaixo do threshold
  IF p_sentiment_score <= v_config.sentiment_threshold THEN
    v_should_fallback := true;
    v_trigger_type := 'negative_sentiment';
    v_trigger_value := jsonb_build_object(
      'sentiment_score', p_sentiment_score,
      'threshold', v_config.sentiment_threshold
    );
  END IF;

  -- VERIFICAR GATILHO 2: Mensagens negativas consecutivas
  IF NOT v_should_fallback THEN
    SELECT COUNT(*) INTO v_consecutive_negative
    FROM (
      SELECT sentiment
      FROM messages
      WHERE conversation_id = p_conversation_id
        AND direction = 'inbound'
        AND sentiment IS NOT NULL
      ORDER BY created_at DESC
      LIMIT v_config.consecutive_negative_messages
    ) recent
    WHERE sentiment = 'negative';

    IF v_consecutive_negative >= v_config.consecutive_negative_messages THEN
      v_should_fallback := true;
      v_trigger_type := 'consecutive_negative';
      v_trigger_value := jsonb_build_object(
        'consecutive_count', v_consecutive_negative,
        'threshold', v_config.consecutive_negative_messages
      );
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'should_fallback', v_should_fallback,
    'trigger_type', v_trigger_type,
    'trigger_value', v_trigger_value,
    'config', row_to_json(v_config)
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- COMENTÁRIOS
-- ============================================
COMMENT ON TABLE ai_fallback_config IS 'Configurações de fallback automático de IA para atendente humano';
COMMENT ON TABLE ai_fallback_logs IS 'Log de todos os fallbacks executados pelo sistema';
COMMENT ON VIEW sentiment_summary IS 'Resumo agregado de sentimentos por conversa';
COMMENT ON FUNCTION get_conversation_sentiment_trend IS 'Retorna tendência de sentimento de últimas 20 mensagens';
COMMENT ON FUNCTION trigger_fallback_if_needed IS 'Verifica se deve acionar fallback baseado em regras configuradas';
