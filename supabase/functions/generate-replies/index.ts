import { createClient } from 'npm:@supabase/supabase-js@2.39.0';
import { Tone } from '../../src/types';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestBody {
  message: string;
  tone: Tone;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tone } = await req.json() as RequestBody;

    if (!message || !tone) {
      return new Response(
        JSON.stringify({ error: 'Message and tone are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are Reply Genie — an expert in texting, emails, and human communication. Your job is to help users respond to incoming messages in a clear, emotionally intelligent way. Always output 3 short, natural-sounding responses based on the user\'s selected tone. Match the reply to the emotional context of the original message and make sure the tone aligns with what the user selected.'
          },
          { 
            role: 'user', 
            content: `Generate 3 different replies to this message in a ${tone} tone. Keep the replies conversational, natural, and not too long: "${message}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate replies');
    }

    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No replies generated');
    }

    // Parse the 3 responses from the content
    const replies = content.split(/(?:^|\n)(?:Option \d:|Reply \d:|Response \d:|^\d\.|\n\n)/g)
      .filter((text: string) => text.trim().length > 0)
      .map((text: string) => text.trim())
      .slice(0, 3);
    
    return new Response(
      JSON.stringify(replies.length === 3 ? replies : content.split('\n\n').filter((text: string) => text.trim().length > 0).slice(0, 3)),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});