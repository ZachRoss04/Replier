import OpenAI from 'openai';
import { GenerateRepliesProps } from '../types';

// Log to help with debugging - only log that it exists, not the actual key
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
console.log('API Key exists:', !!apiKey);
console.log('API Key starts with:', apiKey ? apiKey.substring(0, 8) + '...' : 'undefined');

// Create the OpenAI client only if we have an API key
let openai: OpenAI | null = null;
try {
  if (apiKey) {
    openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true // Allow browser usage
    });
    console.log('OpenAI client initialized successfully');
  } else {
    console.error('No OpenAI API key found in environment variables');
  }
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
}

export const generateReplies = async ({ 
  message, 
  tone, 
  messageType, 
  conversationHistory = [], 
  additionalContext, 
  recipient, 
  conversationMode = 'reply', 
  initialMessageContext = '',
  customTone = '',
  messageLength = 'medium',
}: GenerateRepliesProps): Promise<string[]> => {
  // For conversation starter mode, we need initialMessageContext instead of message
  if (conversationMode === 'start') {
    if (!initialMessageContext || initialMessageContext.trim() === '') {
      throw new Error('Please enter what you want to say');
    }
  } else if (!message) {
    throw new Error('Message is required');
  }

  // Check if OpenAI client is initialized
  if (!openai) {
    console.error('OpenAI client is not initialized. Check your API key.');
    // Return default messages for development/debugging
    return [
      `[No API Key] This would be a ${tone} response to: "${message}"`,
      `[No API Key] Please add a valid OpenAI API key to your .env file`,
      `[No API Key] Set VITE_OPENAI_API_KEY=your_api_key in .env`
    ];
  }

  try {
    // Get current time for context-aware replies
    const currentTime = new Date();
    const timeString = currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    });
    const dateString = currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
    
    // Create message type specific system instructions
    const getSystemInstructions = () => {
      const recipientInfo = recipient ? ` You are helping craft a message to ${recipient}.` : '';
      const modeInfo = conversationMode === 'start' ? ' You are helping the user START a new conversation.' : ' You are helping the user REPLY to an existing conversation.';
      
      // Determine tone description for instructions
      let toneDescription = '';
      if (tone === 'default') {
        toneDescription = 'using the natural tone from the conversation context';
      } else if (tone === 'custom' && customTone) {
        toneDescription = `in a "${customTone}" tone`;
      } else {
        toneDescription = `in a ${tone} tone`;
      }
      
      // Base instructions for all message types
      const baseInstructions = `You are helping craft ${conversationMode === 'start' ? 'initial messages' : 'replies'} ${toneDescription}. The current time is ${timeString} on ${dateString}.${recipientInfo}${modeInfo} ${conversationMode === 'reply' ? 'IMPORTANT: Analyze the exact writing style, structure, and language patterns in the conversation and match them precisely.' : ''} Your responses must be in JSON format.`;
      
      // Advanced instructions for realistic responses
      const realisticResponseGuidelines = `
VERY IMPORTANT GUIDELINES FOR REALISTIC RESPONSES:
1. Be subtly evasive when hiding information. Never hint at surprises or gifts, even indirectly.
2. Your responses must sound exactly like a real human would write - avoid any AI-like formality or perfectionism.
3. Use natural human imperfections like occasional typos, self-corrections, thought shifts, and incomplete sentences when appropriate.
4. Your replies should sound authentic, casual, and match the tone specified.
5. Write as if sending a real message, not as if discussing what to say.
6. Mirror the user's tone, formality level, and messaging style.
7. Your focus is on crafting realistic ${messageType} responses with appropriate language.
8. DO NOT use any emojis in any response whatsoever. 
9. NEVER start a response with phrases like "Hey there!", "I hope this message finds you well", or similar generic greetings.
10. Write like an actual human, not an AI trying to seem friendly. Be authentic, sometimes brief, and never overly enthusiastic.
`;
      
      // Add conversation context instructions with style matching emphasis
      let conversationContext = '';
      if (conversationHistory && conversationHistory.length > 0) {
        conversationContext = '\n\nVERY IMPORTANT: You must carefully analyze and match the exact writing style from the conversation.\nPay attention to message structure, capitalization, punctuation, emoji usage, abbreviations, and slang.\nYour replies should sound like they were written by the same person who wrote the previous messages.\nMake your replies consistent with the conversation flow and match the language style precisely.\nPay special attention to who sent the last message (me or the other person) and respond in MY consistent style.\nYour reply should sound authentic and match how a real person would respond in this exact situation.\nAVOID being overly enthusiastic, formal, or perfect in your replies - real people are casual and sometimes awkward.';
      }
      
      // Message type specific instructions
      let messageTypeInstructions = '';
      
      switch(messageType) {
        case 'text':
          messageTypeInstructions = `
You specialize in writing authentic text message replies.
Keep responses short, use casual language and abbreviations.
Do not use any emojis or emoticons whatsoever.
Avoid formal language or business-style responses.`;
          break;
        
        case 'email':
          messageTypeInstructions = `
You specialize in crafting appropriate email responses.
Include proper email elements like greeting and sign-off.
Match the formality level to the context and relationship.
Avoid text-speak unless the original email uses it.`;
          break;
        
        case 'dm':
          messageTypeInstructions = `
You specialize in crafting direct message responses.
These should be casual, conversational, and personal.
Use appropriate tone based on platform but don't be too formal.
Do not use any emojis or emoticons.`;
          break;
        
        default:
          messageTypeInstructions = `
You specialize in crafting conversational replies.
These should sound natural and match the user's style.
Avoid any AI-like formality or perfectionism.`;
          break;
      }
      
      return `${baseInstructions}\n${realisticResponseGuidelines}\n${messageTypeInstructions}${conversationContext}`;
    };
    
    // Format conversation for the prompt
    const formatConversation = () => {
      let conversationText = '';
      if (conversationHistory && conversationHistory.length > 0) {
        // For conversations with a known recipient, use their name
        const otherPersonLabel = recipient ? recipient : 'Other person';
        conversationText = '\n\nHere is the conversation history (from earliest to latest):\n';
        conversationHistory.forEach((msg) => {
          conversationText += `${msg.sender === 'user' ? 'Me' : otherPersonLabel}: "${msg.content}"\n`;
        });
      }
      
      // Add any additional context
      if (additionalContext && additionalContext.trim()) {
        conversationText += '\n\nAdditional context about this conversation:\n';
        conversationText += additionalContext.trim() + '\n';
      }
      
      return conversationText;
    };

    // User prompt including the message, conversation context, and time
    // Construct the prompt based on conversation mode
    let promptStart = '';
    
    if (conversationMode === 'start') {
      promptStart = `I need to START a ${messageType} conversation with ${recipient || 'someone'}.\n\n` +
      `What I want to communicate: "${initialMessageContext}"\n\n` +
      `${additionalContext ? `Additional context: ${additionalContext}\n\n` : ''}` +
      `Please generate 3 different ways I could start this conversation, based on what I want to communicate.\n\n`;
    } else {
      promptStart = `I need to reply to this ${messageType} conversation${conversationHistory && conversationHistory.length > 0 ? '' : ` message: "${message}"`}
      ${formatConversation()}
      ${recipient ? recipient : 'Other person'}: "${message}"  (this is the message I need to reply to)\n\n`;
    }
    
    // Handle tone instructions based on selected tone type
    let toneInstructions = '';
    if (tone === 'default') {
      toneInstructions = `Maintain the natural tone and style from the conversation. Don't alter the writing style - match it precisely.`;
    } else if (tone === 'custom' && customTone) {
      toneInstructions = `Write in this custom tone: "${customTone}". Use this as your guide for the overall feeling and style.`;
    } else {
      toneInstructions = `Write in a ${tone} tone.`;
    }
    
    // Add length instructions based on messageLength parameter
    let lengthInstructions = '';
    if (messageLength === 'short') {
      lengthInstructions = 'CRITICAL: All responses MUST be exactly one brief sentence. MAXIMUM 15 words. No exceptions. Do not exceed this length under any circumstances.';
    } else if (messageLength === 'medium') {
      lengthInstructions = 'CRITICAL: All responses MUST be 1-2 sentences only, between 20-30 words total. Do not exceed or fall short of this length.';
    } else if (messageLength === 'long') {
      lengthInstructions = 'CRITICAL: All responses MUST be a FULL DETAILED PARAGRAPH with 5-8 sentences. Use between 100-120 words total. Include significant detail, explanation, and elaboration. This should read like a complete thought with multiple connected points and thorough explanation.';
    }
    
    const styleInstructions = `Make the replies sound authentic, like something a real person would actually write. Avoid sounding like AI or being overly formal. ${toneInstructions} ${lengthInstructions}`;
    
    // Time context
    const timeContext = `It's ${timeString} on ${dateString}.`;
    
    // Final request format
    const returnFormat = 'Return your response as a JSON array of exactly 3 strings, with no additional text.';
    
    // Complete prompt
    const prompt = `${promptStart}Generate 3 different ways I could ${conversationMode === 'start' ? 'start' : 'reply to'} this ${messageType}.
${styleInstructions}
${timeContext}

${additionalContext && conversationMode !== 'start' ? `IMPORTANT - Consider this additional context: ${additionalContext}

` : ''}
${returnFormat}`;
    
    const instructions = getSystemInstructions();

    try {
      // Word limits for different message lengths
      const wordLimits = {
        short: 15,   // One brief sentence
        medium: 30,  // 1-2 sentences
        long: 120    // Full paragraph (5-8 sentences)
      };
      
      // Calculate max tokens based on message length
      let maxTokens = 1000; // default for long responses 
      if (messageLength === 'short') {
        maxTokens = 100; // Short responses
      } else if (messageLength === 'medium') {
        maxTokens = 250; // Medium responses
      }
      
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: instructions
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: maxTokens
      });

      // Get response content
      const responseContent = response.choices[0]?.message?.content;
      
      if (!responseContent) {
        throw new Error('No response content received from API');
      }
      
      // Function to enforce word count limits based on message length
      const truncateToWordLimit = (text: string): string => {
        const wordLimit = wordLimits[messageLength];
        const words = text.split(/\\s+/).filter(word => word.trim().length > 0);
        
        if (words.length <= wordLimit) return text;
        
        // Truncate to word limit
        const truncated = words.slice(0, wordLimit).join(' ');
        // Ensure proper punctuation at the end
        return truncated.match(/[.!?]$/) ? truncated : truncated + '.';
      };
      
      // Extract replies from response
      let replies: string[] = [];
      
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(responseContent);
        if (Array.isArray(parsed)) {
          replies = parsed
            .filter(item => typeof item === 'string' && item.trim().length > 0)
            .map(truncateToWordLimit);
        }
      } catch (jsonError) {
        console.log('JSON parsing failed, extracting replies from text', jsonError);
        console.log('Response content:', responseContent);
        
        // Split by numbered lines (e.g., "1.", "2.", "3.")
        const lines = responseContent.split('\\n');
        let currentReply = '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          // Check if line starts with a number and period
          if (/^\\d+\\.\\s/.test(trimmedLine)) {
            // If we have a previous reply accumulated, add it
            if (currentReply) {
              replies.push(truncateToWordLimit(currentReply));
              currentReply = '';
            }
            // Start a new reply, removing the number prefix
            currentReply = trimmedLine.replace(/^\\d+\\.\\s/, '');
          } else if (trimmedLine && currentReply) {
            // Continue adding to the current reply
            currentReply += ' ' + trimmedLine;
          } else if (trimmedLine && replies.length < 3) {
            // If it's a standalone line and we need more replies
            replies.push(truncateToWordLimit(trimmedLine));
          }
        }
        
        // Add the last reply if there is one
        if (currentReply) {
          replies.push(truncateToWordLimit(currentReply));
        }
        
        // If we still don't have any replies, just split by lines
        if (replies.length === 0) {
          replies = lines
            .filter(line => line.trim().length > 0)
            .slice(0, 3)
            .map(truncateToWordLimit);
        }
      }
      
      // If we have fewer than 3 replies, add defaults
      if (replies.length < 3) {
        const defaultReplies = [
          `I'll get back to you soon.`,
          `Thanks for your message, I'll think about it.`,
          `I'll respond properly when I have time.`
        ].map(truncateToWordLimit);
        
        replies = [...replies, ...defaultReplies].slice(0, 3);
      }
      
      return replies.slice(0, 3);
      
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  } catch (error) {
    console.error('Error in generateReplies:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    } else {
      console.error('Unknown error type:', error);
    }
    throw error;
  }
};
