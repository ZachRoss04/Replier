import { ToneOption } from '../types';

export const TONE_OPTIONS: ToneOption[] = [
  {
    value: 'default',
    label: 'Natural',
    emoji: '💬',
    description: 'Maintain original tone and style',
    color: 'bg-gray-100 text-gray-700'
  },
  {
    value: 'chill',
    label: 'Chill',
    emoji: '😎',
    description: 'Relaxed and casual',
    color: 'bg-indigo-100 text-indigo-700'
  },
  {
    value: 'kind',
    label: 'Kind',
    emoji: '🤗',
    description: 'Warm and supportive',
    color: 'bg-emerald-100 text-emerald-700'
  },
  {
    value: 'assertive',
    label: 'Assertive',
    emoji: '💪',
    description: 'Direct and confident',
    color: 'bg-amber-100 text-amber-700'
  },
  {
    value: 'flirty',
    label: 'Flirty',
    emoji: '😏',
    description: 'Playful and suggestive',
    color: 'bg-rose-100 text-rose-700'
  },
  {
    value: 'funny',
    label: 'Funny',
    emoji: '😂',
    description: 'Humorous and light',
    color: 'bg-orange-100 text-orange-700'
  },
  {
    value: 'professional',
    label: 'Professional',
    emoji: '👔',
    description: 'Formal and business-like',
    color: 'bg-slate-100 text-slate-700'
  },
  {
    value: 'custom',
    label: 'Custom Tone',
    emoji: '✨',
    description: 'Premium: Define your own tone',
    color: 'bg-purple-100 text-purple-700'
  }
];

export const DEFAULT_REPLIES = [
  "I'm generating your replies now...",
  "Just a moment while I craft some options...",
  "Working on the perfect response..."
];

export const SYSTEM_PROMPT = `You are Reply Genie — an expert in texting, emails, and human communication. Your job is to help users respond to incoming messages in a clear, emotionally intelligent way. Always output 3 short, natural-sounding responses based on the user's selected tone. Match the reply to the emotional context of the original message and make sure the tone aligns with what the user selected.`;