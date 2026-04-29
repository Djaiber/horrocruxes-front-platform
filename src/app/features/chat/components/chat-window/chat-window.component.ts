import { Component, OnDestroy, computed, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ChatService } from '../../services/chat.service';
import { HP_CHARACTERS } from '../../../../shared/models/chat.model';
import { MessageBubbleComponent } from '../message-bubble/message-bubble.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';

const WAITING_PHRASES = [
  'Consulting the Marauder\'s Map...',
  'Brewing the perfect potion...',
  'Accio answer...',
  'The Sorting Hat is deliberating...',
  'Searching the Restricted Section...',
  'Sending an owl to Hogwarts...',
  'Deciphering the castle secrets...',
  'Hogwarts ghosts are consulting...',
  'Expecto Patronum... summoning the answer...',
  'Turning the pages of the spell book...',
  'Nox... Lumos... searching the shadows...',
  'The Mirror of Erised is reflecting...',
  'Alohomora — unlocking knowledge...',
  'Wingardium Leviosa — elevating thoughts...',
  'The centaurs read the stars for you...',
  'Apparating through time and space...',
  'Peeves is causing mischief on the way...',
  'Dumbledore\'s gargoyle asks for the password...',
  'Consulting the Pensieve of memories...',
  'House elves are on it, promise...',
  'Dobby found a sock and is searching...',
  'Navigating the Forbidden Forest carefully...',
  'The Augurey cries... good sign this time...',
  'Transforming data with advanced Transfiguration...',
  'Searching Ministry of Magic archives...',
  'The Prophecy is being deciphered...',
  'Mounting a broomstick and soaring...',
  'Hagrid is clearing the path with his umbrella...',
  'Fawkes the phoenix carries the message...',
  'Aurors investigate before answering...',
  'Silence in Snape\'s Potions classroom...',
  'Divination says the answer will arrive...',
  'Tom Riddle writes in a diary... scratch that...',
  'Reparo! Rebuilding the answer piece by piece...',
  'Riddikulus — turning waiting into magic...',
];

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [MessageBubbleComponent, ChatInputComponent, LucideAngularModule],
  templateUrl: './chat-window.component.html',
})
export class ChatWindowComponent implements OnDestroy {
  @ViewChild('messageList') messageList!: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatService);

  readonly activeChat = this.chatService.activeChat;
  readonly sending    = this.chatService.sending;
  readonly characters = HP_CHARACTERS;
  readonly waitingPhrase = signal('');

  private phraseInterval: ReturnType<typeof setInterval> | null = null;
  private phraseIndex = 0;

  readonly messages = computed(() => {
    const chat = this.activeChat();
    return chat ? this.chatService.getMessages(chat.id) : [];
  });

  constructor() {
    effect(() => {
      this.messages();
      setTimeout(() => this.scrollToBottom(), 50);
    });

    effect(() => {
      if (this.sending()) {
        this.startPhrases();
      } else {
        this.stopPhrases();
      }
    });
  }

  ngOnDestroy(): void {
    this.stopPhrases();
  }

  onSend(content: string): void {
    const chat = this.activeChat();
    if (!chat || !content.trim()) return;
    this.chatService.sendMessage(chat.id, content.trim());
  }

  private startPhrases(): void {
    this.phraseIndex = Math.floor(Math.random() * WAITING_PHRASES.length);
    this.waitingPhrase.set(WAITING_PHRASES[this.phraseIndex]);
    this.phraseInterval = setInterval(() => {
      this.phraseIndex = (this.phraseIndex + 1) % WAITING_PHRASES.length;
      this.waitingPhrase.set(WAITING_PHRASES[this.phraseIndex]);
    }, 3500);
  }

  private stopPhrases(): void {
    if (this.phraseInterval) {
      clearInterval(this.phraseInterval);
      this.phraseInterval = null;
    }
    this.waitingPhrase.set('');
  }

  private scrollToBottom(): void {
    const el = this.messageList?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }
}
