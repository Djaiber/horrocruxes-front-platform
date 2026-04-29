import { Component, OnInit, inject, input } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { ChatSidebarComponent } from '../../components/chat-sidebar/chat-sidebar.component';
import { ChatWindowComponent } from '../../components/chat-window/chat-window.component';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [ChatSidebarComponent, ChatWindowComponent],
  templateUrl: './chat-page.component.html',
})
export class ChatPageComponent implements OnInit {
  private chatService = inject(ChatService);

  chatId = input<string | undefined>(undefined);

  ngOnInit(): void {
    const id = this.chatId();
    if (id) {
      this.chatService.setActiveChat(id);
    } else {
      const chats = this.chatService.chats();
      if (chats.length > 0) {
        this.chatService.setActiveChat(chats[0].id);
      }
    }
  }
}
