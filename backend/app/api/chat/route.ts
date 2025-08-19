import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Inicializa o cliente da OpenAI com sua chave de API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ID do seu agente, o "asst_..."
const ASSISTANT_ID = 'asst_t7FWCeeQmALVKhbyf4UfsFHJ';

// Define a função que irá lidar com as requisições POST
async function handleChat(request: NextRequest) {
  try {
    const { messages, conversationId, userId } = await request.json();

    let threadId = conversationId;

    // Se a conversa for nova (sem um ID), cria uma nova thread
    if (!threadId) {
      const thread = await openai.beta.threads.create();
      threadId = thread.id;
      // TODO: Salve este 'threadId' no seu banco de dados, associado ao 'userId'.
    }
    
    // Pega a última mensagem do usuário do array de mensagens
    const userMessage = messages[messages.length - 1].text;

    // Adiciona a mensagem do usuário à thread
    await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: userMessage,
      }
    );

    // Inicia a execução do seu assistente
    let run = await openai.beta.threads.runs.create(
      threadId,
      {
        assistant_id: ASSISTANT_ID,
      }
    );

    // Fica em um loop (polling) para checar o status da execução
    while (run.status !== "completed") {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // SOLUÇÃO FINAL: A chamada para `retrieve` foi corrigida para usar snake_case
      run = await openai.beta.threads.runs.retrieve(run.id, { thread_id: threadId });
    }

    // Pega as mensagens da thread após a execução para obter a resposta do agente
    const threadMessages = await openai.beta.threads.messages.list(threadId);

    // Extrai o conteúdo da última mensagem do assistente
    const agentResponse = threadMessages.data[0].content[0].type === 'text' ? threadMessages.data[0].content[0].text.value : '';

    // TODO: Salve a resposta do agente no seu banco de dados para o histórico.

    // Retorna a resposta e o ID da conversa para o frontend
    return NextResponse.json({ response: agentResponse, conversationId: threadId });

  } catch (error: any) {
    console.error("Erro na API de Assistants:", error);
    return NextResponse.json({ message: "Ocorreu um erro ao processar a requisição." }, { status: 500 });
  }
}

// Exporta a função para lidar com requisições POST
export { handleChat as POST };