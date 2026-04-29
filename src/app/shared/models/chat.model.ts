export type HpCharacter = 'dumbledore' | 'hermione' | 'ron' | 'snape' | 'luna';

export const HP_CHARACTERS: Record<HpCharacter, { label: string; description: string; icon: string }> = {
  dumbledore: { label: 'Albus Dumbledore', description: 'Wise, philosophical, enigmatic', icon: 'wand-sparkles' },
  hermione:   { label: 'Hermione Granger', description: 'Precise, intelligent, thorough', icon: 'book-open' },
  ron:        { label: 'Ron Weasley',       description: 'Casual, funny, loyal', icon: 'shield' },
  snape:      { label: 'Severus Snape',     description: 'Sarcastic, brilliant, cold', icon: 'moon' },
  luna:       { label: 'Luna Lovegood',     description: 'Dreamy, peculiar, clever', icon: 'star' },
};

export interface Chat {
  id: string;
  title: string;
  character: HpCharacter;
  createdAt: string;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  content: string;
  character: HpCharacter;
}

export interface SendMessageResponse {
  userMessage: Message;
  botMessage: Message;
}
