import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { HP_CHARACTERS, HpCharacter, Message } from '../../../../shared/models/chat.model';

@Component({
  selector: 'app-message-bubble',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <div
      class="flex items-end gap-2 animate-slide-up"
      [class.flex-row-reverse]="message().role === 'user'"
    >
      <!-- Avatar (solo bot) -->
      @if (message().role === 'assistant') {
        <div class="w-8 h-8 rounded-full bg-hp-border/60 flex items-center justify-center flex-shrink-0 mb-0.5">
          <lucide-icon [name]="characters[character()].icon" class="w-4 h-4 text-hp-gold"></lucide-icon>
        </div>
      }

      <!-- Burbuja -->
      <div
        class="max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
        [class.bg-hp-gold]="message().role === 'user'"
        [class.text-hp-dark]="message().role === 'user'"
        [class.rounded-br-sm]="message().role === 'user'"
        [class.font-medium]="message().role === 'user'"
        [class.bg-hp-surface]="message().role === 'assistant'"
        [class.border]="message().role === 'assistant'"
        [class.border-hp-border]="message().role === 'assistant'"
        [class.text-gray-100]="message().role === 'assistant'"
        [class.rounded-bl-sm]="message().role === 'assistant'"
      >
        {{ message().content }}
        <p
          class="text-[10px] mt-1 opacity-60"
          [class.text-right]="message().role === 'user'"
        >
          {{ formatTime(message().createdAt) }}
        </p>
      </div>
    </div>
  `,
})
export class MessageBubbleComponent {
  message   = input.required<Message>();
  character = input.required<HpCharacter>();

  readonly characters = HP_CHARACTERS;

  formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }
}
