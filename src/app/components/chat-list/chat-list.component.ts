import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Chat, useChatStore } from '../../stores/chat.store';
import { useAuthStore } from '../../stores/auth.store';
import { DatePipe, NgIf, NgFor } from '@angular/common';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { NewChatComponent } from '../new-chat/new-chat.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [RouterModule, DatePipe], // ✅ Add structural directives if needed in HTML
  providers: [DialogService],           // ✅ Required for PrimeNG Dialog to work
  templateUrl: 'chat-list.component.html',
  styleUrls: ['chat-list.component.scss'], // ✅ Corrected 'styleUrl' to 'styleUrls'
})
export class ChatListComponent implements OnInit 
{
  private dialogService = inject(DialogService);
  private dialogRef?: DynamicDialogRef;

  chatStore = inject(useChatStore);
  authStore = inject(useAuthStore);
  router = inject(Router);

  ngOnInit() {
    const userId = this.authStore.currentUser()?.uid;
    if (userId) {
      this.chatStore.listenToChats(userId);
    }
  }

  openNewChatPopup() {
    this.dialogRef = this.dialogService.open(NewChatComponent, {
      header: '',
      width: '400px',
      dismissableMask: true,
      styleClass: 'p-dialog-custom',
      data: {}
    });
  }

  getChatName(chat: Chat): string {
    if (chat.participantNames) {
      return chat.participantNames
        .filter(name => name !== this.authStore.currentUser()?.displayName)
        .join(', ');
    }
    return 'Loading...';
  }

  goToChat(chat: Chat) {
    this.router.navigate(['/chat-room', chat.id]);
  }

  logout() {
    this.authStore.logout();
    this.router.navigate(['/login']);
  }
}
