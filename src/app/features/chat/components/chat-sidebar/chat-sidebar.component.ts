import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../../core/auth/services/auth.service';
import { HP_CHARACTERS, HpCharacter } from '../../../../shared/models/chat.model';

@Component({
  selector: 'app-chat-sidebar',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './chat-sidebar.component.html',
})
export class ChatSidebarComponent {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private router      = inject(Router);

  readonly chats      = this.chatService.sortedChats;
  readonly activeChat = this.chatService.activeChat;
  readonly characters = HP_CHARACTERS;

  showCharacterPicker = signal(false);
  deletingId          = signal<string | null>(null);

  newChat(character: HpCharacter = 'dumbledore'): void {
    const chat = this.chatService.createChat(character);
    this.showCharacterPicker.set(false);
    this.router.navigate(['/chat', chat.id]);
  }

  selectChat(chatId: string): void {
    this.chatService.setActiveChat(chatId);
    this.router.navigate(['/chat', chatId]);
  }

  deleteChat(event: Event, chatId: string): void {
    event.stopPropagation();
    this.deletingId.set(chatId);
    setTimeout(() => {
      this.chatService.deleteChat(chatId);
      this.deletingId.set(null);
      if (!this.chatService.activeChat()) {
        this.router.navigate(['/chat']);
      }
    }, 300);
  }

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/auth/login']);
  }

  getCharacter(key: HpCharacter) {
    return HP_CHARACTERS[key];
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffH  = diffMs / 3600000;
    if (diffH < 24)  return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    if (diffH < 168) return d.toLocaleDateString('es', { weekday: 'short' });
    return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
  }

  characterKeys = Object.keys(HP_CHARACTERS) as HpCharacter[];
}
