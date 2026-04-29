import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Chat, HpCharacter, Message, SendMessageResponse } from '../../../shared/models/chat.model';
import { environment } from '../../../../environments/environment';

const CHATS_KEY    = 'hp_chats';
const MESSAGES_KEY = 'hp_messages';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  private readonly _chats      = signal<Chat[]>(this.loadChats());
  private readonly _activeChat = signal<Chat | null>(null);
  private readonly _messages   = signal<Record<string, Message[]>>(this.loadMessages());
  private readonly _sending    = signal(false);

  readonly chats      = this._chats.asReadonly();
  readonly activeChat = this._activeChat.asReadonly();
  readonly sending    = this._sending.asReadonly();
  readonly sortedChats = computed(() =>
    [...this._chats()].sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    ),
  );

  getMessages(chatId: string): Message[] {
    return this._messages()[chatId] ?? [];
  }

  setActiveChat(chatId: string): void {
    const chat = this._chats().find((c) => c.id === chatId) ?? null;
    this._activeChat.set(chat);
  }

  createChat(character: HpCharacter = 'dumbledore'): Chat {
    const now  = new Date().toISOString();
    const chat: Chat = {
      id:            crypto.randomUUID(),
      title:         'New conversation',
      character,
      createdAt:     now,
      lastMessageAt: now,
    };
    this.persistChats([chat, ...this._chats()]);
    this._activeChat.set(chat);
    return chat;
  }

  deleteChat(chatId: string): void {
    const updated = this._chats().filter((c) => c.id !== chatId);
    this.persistChats(updated);

    if (this._activeChat()?.id === chatId) {
      this._activeChat.set(updated[0] ?? null);
    }

    const msgs = { ...this._messages() };
    delete msgs[chatId];
    this.persistMessages(msgs);
  }

  renameChat(chatId: string, title: string): void {
    const updated = this._chats().map((c) =>
      c.id === chatId ? { ...c, title } : c,
    );
    this.persistChats(updated);
  }

  async sendMessage(chatId: string, content: string): Promise<void> {
    const chat = this._chats().find((c) => c.id === chatId);
    if (!chat) return;

    const userMsg: Message = {
      id:        crypto.randomUUID(),
      chatId,
      role:      'user',
      content,
      createdAt: new Date().toISOString(),
    };
    this.appendMessage(chatId, userMsg);
    this.autoTitle(chatId, content);
    this._sending.set(true);

    try {
      const res = await firstValueFrom(
        this.http.post<SendMessageResponse>(
          `${environment.apiUrl}/chats/${chatId}/messages`,
          { content, character: chat.character },
        ),
      );
      this.appendMessage(chatId, res.botMessage);
    } catch {
      // Mock while the backend isn't ready
      const botMsg: Message = {
        id:        crypto.randomUUID(),
        chatId,
        role:      'assistant',
        content:   '🧙‍♂️ The backend is still under construction... but soon I\'ll respond with all the magic of Hogwarts.',
        createdAt: new Date().toISOString(),
      };
      this.appendMessage(chatId, botMsg);
    } finally {
      this._sending.set(false);
      this.touchChat(chatId);
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private appendMessage(chatId: string, msg: Message): void {
    const current = this._messages();
    const updated = { ...current, [chatId]: [...(current[chatId] ?? []), msg] };
    this.persistMessages(updated);
  }

  private autoTitle(chatId: string, content: string): void {
    const chat = this._chats().find((c) => c.id === chatId);
    if (!chat || chat.title !== 'New conversation') return;
    const title = content.length > 40 ? content.slice(0, 37) + '...' : content;
    const updated = this._chats().map((c) => (c.id === chatId ? { ...c, title } : c));
    this.persistChats(updated);
  }

  private touchChat(chatId: string): void {
    const updated = this._chats().map((c) =>
      c.id === chatId ? { ...c, lastMessageAt: new Date().toISOString() } : c,
    );
    this.persistChats(updated);
  }

  private persistChats(chats: Chat[]): void {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
    this._chats.set(chats);
  }

  private persistMessages(msgs: Record<string, Message[]>): void {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs));
    this._messages.set(msgs);
  }

  private loadChats(): Chat[] {
    try { return JSON.parse(localStorage.getItem(CHATS_KEY) ?? '[]'); } catch { return []; }
  }

  private loadMessages(): Record<string, Message[]> {
    try { return JSON.parse(localStorage.getItem(MESSAGES_KEY) ?? '{}'); } catch { return {}; }
  }
}
