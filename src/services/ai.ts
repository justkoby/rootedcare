import { supabase } from '../lib/supabase';

export type RelatedItem = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
};

export type AIResponse = {
  reply?: string;
  relatedHerbs?: RelatedItem[];
  relatedWellness?: RelatedItem[];
  relatedArticles?: RelatedItem[];
  safetyLevel?: string;
  conversation_id?: string;
  error?: string;
};

export async function askRootedCareAI(
  message: string,
  options?: { conversation_id?: string },
): Promise<AIResponse> {
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    throw new Error('Please enter a message.');
  }

  const { data, error } = await supabase.functions.invoke<AIResponse>(
    'rootedcare-ai',
    {
      body: {
        message: cleanMessage,
        conversation_id: options?.conversation_id ?? null,
      },
    },
  );

  if (error) {
    console.error('AI function error:', error);
    throw new Error('The RootedCare assistant is currently unavailable.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.reply) {
    throw new Error('The assistant returned an empty response.');
  }

  return data;
}
