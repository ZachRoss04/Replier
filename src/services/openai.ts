import { Tone } from '../types';

interface GenerateRepliesProps {
  message: string;
  tone: Tone;
}

export const generateReplies = async ({ message, tone }: GenerateRepliesProps): Promise<string[]> => {
  if (!message) {
    throw new Error('Message is required');
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-replies`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, tone })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate replies');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating replies:', error);
    throw error;
  }
};