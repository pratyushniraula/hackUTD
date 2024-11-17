import { NextResponse } from "next/server";
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from '@aws-sdk/client-bedrock-agent-runtime';
import OpenAI from 'openai';

// Initialize the OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const bedrockClient = new BedrockAgentRuntimeClient({ region: 'us-east-1' });

const systemPrompt = `You are an AI-powered support assistant for diabetes management. Your responses should be professional, concise, and well-organized. Follow these guidelines:
1. Provide information in a structured format with bullet points or numbered lists.
2. Ensure each point is separated by a newline for clarity.
3. Avoid overly lengthy responses.
4. Keep responses brief, clear, and to the point.
5. If you are unsure about any information, say you don't know and suggest consulting a healthcare professional.
6. Offer to connect the user with a human representative if needed.

Your goal is to provide accurate information, assist with diabetes management, and ensure a positive experience for users seeking support.`;

// Define an asynchronous POST function to handle incoming requests
export async function POST(req) {
  try {
    const messages = await req.json(); // Expecting an array of messages
    const userMessage = messages.find(msg => msg.role === 'user')?.content;

    if (!userMessage) {
      return new NextResponse('No user message found', { status: 400 });
    }

    // Call the OpenAI API for chat completion
    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...messages, // Pass all messages to OpenAI
      ],
      model: "gpt-4",  // Replace with your desired model if needed
      stream: true, // Enable streaming for chunked response
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          let buffer = '';
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
              buffer += content;
              // Check if the buffer contains a complete response
              if (buffer.endsWith('\n\n')) {
                controller.enqueue(encoder.encode(buffer));
                buffer = '';
              }
            }
          }
          // Enqueue any remaining buffer content
          if (buffer) {
            controller.enqueue(encoder.encode(buffer));
          }
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, { headers: { 'Content-Type': 'text/plain' } });

  } catch (error) {
    console.error('Error handling POST request:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
