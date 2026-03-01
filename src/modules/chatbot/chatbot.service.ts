import OpenAI from 'openai';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

const openai = new OpenAI({
    apiKey: env.openai.apiKey,
    ...(env.openai.baseUrl ? { baseURL: env.openai.baseUrl } : {}),
});

const SYSTEM_PROMPT = `You are the ASTU Campus Assistant, an AI helper for Adama Science and Technology University.
Your sole purpose is to assist students with ASTU campus-related issues including:
- Dormitory problems (maintenance, facilities, hygiene)
- Internet and IT issues
- Classroom and laboratory equipment
- Academic inquiries and processes
- Campus facilities and services

Guidelines:
- ONLY answer questions related to ASTU campus life and university services
- For issues that require formal action, guide users to submit a complaint ticket through the system
- Be empathetic, helpful, and professional
- If a question is unrelated to ASTU campus, politely decline and redirect to campus topics
- Keep responses concise and actionable
- You do not have access to real-time data or individual complaint statuses`;

export const ChatbotService = {
    async sendMessage(userMessage: string, conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []) {
        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10), // Keep last 10 messages for context
            { role: 'user', content: userMessage },
        ];

        const completion = await Promise.race([
            openai.chat.completions.create({
                model: env.openai.model,
                messages,
                max_tokens: 500,
                temperature: 0.7,
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('AI service timeout')), 30000),
            ),
        ]) as OpenAI.ChatCompletion;

        const reply = completion.choices[0]?.message?.content ?? 'Sorry, I could not process your request. Please try again.';
        return { reply, model: env.openai.model };
    },
};
