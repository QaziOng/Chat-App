// src/app/components/chat-list/chat-list.component.ts

import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Chat, useChatStore } from '../../stores/chat.store';
import { useAuthStore } from '../../stores/auth.store';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [RouterModule, DatePipe],
  templateUrl: 'chat-list.component.html',
})
export class ChatListComponent implements OnInit {
  chatStore = inject(useChatStore);
  authStore = inject(useAuthStore);
  router = inject(Router);

  ngOnInit() {
    const userId = this.authStore.currentUser()?.uid;
    if (userId) {
      this.chatStore.listenToChats(userId);
    } else {
      this.router.navigate(['/login']);
    }
  }

  getChatName(chat: Chat): string {
    if (chat.participantNames) {
      return chat.participantNames
        .filter((name) => name !== this.authStore.currentUser()?.displayName)
        .join(', ');
    }
    return 'Loading...';
  }

  goToChat(chat: Chat) {
    this.router.navigate(['/chat-room', chat.id]); // Passes chat.id to route
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}