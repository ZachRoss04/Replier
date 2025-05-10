export type Tone = 'default' | 'chill' | 'kind' | 'assertive' | 'flirty' | 'funny' | 'professional' | 'custom';

export type MessageType = 'text' | 'dm' | 'email';

export type MessageSender = 'user' | 'other' | 'me';

export interface ConversationMessage {
  content: string;
  sender: MessageSender;
  timestamp?: string; // Optional timestamp for when the message was sent
}

export interface ToneOption {
  value: Tone;
  label: string;
  emoji: string;
  description: string;
  color: string;
}

export interface ReplyOption {
  id: number;
  text: string;
}

export interface MessageTypeOption {
  value: MessageType;
  label: string;
  icon: string;
  description: string;
}

export interface APIKeyState {
  key: string;
  isStored: boolean;
}

export type ConversationMode = 'reply' | 'start';

export type MessageLength = 'short' | 'medium' | 'long';

export interface GenerateRepliesProps {
  message: string;
  tone: Tone;
  messageType: MessageType;
  conversationHistory?: ConversationMessage[];
  additionalContext?: string;
  recipient?: string;
  conversationMode?: ConversationMode;
  initialMessageContext?: string; // For starting conversations
  customTone?: string; // For custom tone (premium feature)
  messageLength?: MessageLength; // Controls response length
}