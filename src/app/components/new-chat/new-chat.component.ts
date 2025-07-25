// src/app/components/new-chat/new-chat.component.ts

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { useChatStore } from '../../stores/chat.store';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'new-chat.component.html',
})
export class NewChatComponent {
  participantEmail = '';
  errorMessage = signal<string | null>(null);
  private chatStore = inject(useChatStore);
  private router = inject(Router);

  async onSubmit() {
    try {
      const chatId = await this.chatStore.createNewChat(this.participantEmail);
      this.router.navigate(['/chat', chatId]);
    } catch (error) {
      console.error('New chat error:', error);
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set(
          'An unexpected error occurred. Please try again.'
        );
      }
    }
  }
}