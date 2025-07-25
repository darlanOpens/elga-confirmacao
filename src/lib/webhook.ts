interface WebhookPayload {
  event: string;
  timestamp: string;
  body: {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    empresa: string;
    cargo: string;
    convidado_por: string;
    status: string;
    data_cadastro: string;
  };
}

export async function sendGuestAddedWebhook(guestData: any): Promise<void> {
  console.log('🔍 Iniciando verificação de webhook...');
  console.log('📋 Dados do convidado recebidos:', JSON.stringify(guestData, null, 2));
  
  // Usar a URL do webhook da variável de ambiente ou fallback para a URL existente
  const webhookUrl = process.env.WEBHOOK_URL || "https://n8n.opens.com.br/webhook/elga-guests";
  
  console.log('🌐 WEBHOOK_URL configurada:', webhookUrl);
  console.log('🔧 Variável de ambiente WEBHOOK_URL:', process.env.WEBHOOK_URL || 'NÃO CONFIGURADA');
  
  const payload: WebhookPayload = {
    event: 'guest_added',
    timestamp: new Date().toISOString(),
    body: {
      id: guestData.id,
      nome: guestData.nome,
      email: guestData.email,
      telefone: guestData.telefone,
      empresa: guestData.empresa,
      cargo: guestData.cargo,
      convidado_por: guestData.convidado_por,
      status: guestData.status,
      data_cadastro: guestData.data_cadastro.toISOString(),
    },
  };

  try {
    console.log('📤 Enviando webhook para:', webhookUrl);
    console.log('📋 Payload:', JSON.stringify(payload, null, 2));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ELGA-Guest-System/1.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('📊 Status do webhook:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Webhook falhou com status: ${response.status}, resposta: ${errorText}`);
    }

    console.log('✅ Webhook enviado com sucesso!');
  } catch (error) {
    // Log do erro mas não falha a operação principal
    console.error('❌ Erro ao enviar webhook:', error);
  }
  
  console.log('🏁 Finalizando função sendGuestAddedWebhook');
} 