/**
 * Helper para lidar com mensagens quebradas
 * Aguarda um tempo antes de processar para garantir que todas as partes da mensagem chegaram
 */

interface PendingMessage {
  conversationId: string;
  contactId: string;
  messages: string[];
  timer: NodeJS.Timeout;
  callback: (fullMessage: string) => void;
}

class MessageDebouncer {
  private pendingMessages: Map<string, PendingMessage> = new Map();
  private defaultDelay: number = 3000; // 3 segundos padrão

  /**
   * Adiciona uma mensagem ao debouncer
   * @param key - Chave única (ex: conversationId ou contactId)
   * @param message - Conteúdo da mensagem
   * @param callback - Função a ser chamada quando a mensagem completa estiver pronta
   * @param delay - Tempo de espera em ms (padrão: 3000ms)
   */
  addMessage(
    key: string,
    message: string,
    callback: (fullMessage: string) => void,
    delay: number = this.defaultDelay
  ) {
    // Se já existe mensagem pendente para esta chave, cancela o timer anterior
    if (this.pendingMessages.has(key)) {
      const pending = this.pendingMessages.get(key)!;
      clearTimeout(pending.timer);

      // Adiciona a nova mensagem ao array
      pending.messages.push(message);

      // Cria novo timer
      pending.timer = setTimeout(() => {
        this.processMessages(key);
      }, delay);
    } else {
      // Cria nova entrada
      const timer = setTimeout(() => {
        this.processMessages(key);
      }, delay);

      this.pendingMessages.set(key, {
        conversationId: key,
        contactId: key,
        messages: [message],
        timer: timer,
        callback: callback
      });
    }

    console.log(`📨 Mensagem adicionada ao debouncer. Total de partes: ${this.pendingMessages.get(key)?.messages.length}`);
  }

  /**
   * Processa todas as mensagens pendentes para uma chave
   */
  private processMessages(key: string) {
    const pending = this.pendingMessages.get(key);

    if (!pending) return;

    // Junta todas as mensagens com quebra de linha
    const fullMessage = pending.messages.join('\n');

    console.log(`✅ Processando mensagem completa (${pending.messages.length} partes):`, fullMessage);

    // Chama o callback com a mensagem completa
    pending.callback(fullMessage);

    // Remove do mapa
    this.pendingMessages.delete(key);
  }

  /**
   * Força o processamento imediato de uma chave
   */
  forceProcess(key: string) {
    const pending = this.pendingMessages.get(key);

    if (!pending) return;

    clearTimeout(pending.timer);
    this.processMessages(key);
  }

  /**
   * Limpa todas as mensagens pendentes
   */
  clear() {
    this.pendingMessages.forEach((pending) => {
      clearTimeout(pending.timer);
    });
    this.pendingMessages.clear();
  }

  /**
   * Verifica se há mensagens pendentes para uma chave
   */
  hasPending(key: string): boolean {
    return this.pendingMessages.has(key);
  }

  /**
   * Retorna o número de partes da mensagem pendente
   */
  getPendingCount(key: string): number {
    return this.pendingMessages.get(key)?.messages.length || 0;
  }

  /**
   * Define o delay padrão
   */
  setDefaultDelay(delay: number) {
    this.defaultDelay = delay;
  }
}

// Exporta instância singleton
export const messageDebouncer = new MessageDebouncer();

// Exporta classe para criar instâncias customizadas se necessário
export default MessageDebouncer;
