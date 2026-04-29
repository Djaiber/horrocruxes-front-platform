import { Component, ElementRef, ViewChild, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat-input.component.html',
})
export class ChatInputComponent {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  disabled    = input(false);
  sendMessage = output<string>();

  text = signal('');

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submit();
    }
  }

  submit(): void {
    const content = this.text().trim();
    if (!content || this.disabled()) return;
    this.sendMessage.emit(content);
    this.text.set('');
    setTimeout(() => this.autoResize(), 0);
  }

  autoResize(): void {
    const el = this.textarea?.nativeElement;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }
}
