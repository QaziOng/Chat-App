import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { useChatStore } from '../../stores/chat.store';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: 'new-chat.component.html',
  styleUrls: ['./new-chat.component.scss']
})
export class NewChatComponent {
  errorMessage = signal<string | null>(null);

  // New search field bound with ngModel
  searchQuery = '';
  searchPerformed = false;

  // Dummy user list (replace with real fetch)
  users = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com' },
    { id: '2', name: 'Bob Smith', email: 'bob@example.com' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@example.com' }
  ];

  filteredUsers: { id: string; name: string; email: string }[] = [];

  private chatStore = inject(useChatStore);
  private router = inject(Router);

  constructor(private dialogRef: MatDialogRef<NewChatComponent>) {}

  // Search user by name
  searchUsers(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.searchPerformed = true;

    this.filteredUsers = this.users.filter(user =>
      user.name.toLowerCase().includes(query)
    );
  }

  // Start chat with selected user
  async startChat(user: { email: string }) 
  {
    try {
      const chatId = await this.chatStore.createNewChat(user.email);

      if (chatId) 
      {
        this.errorMessage.set(null);
        await this.router.navigate(['/home/chat'], { queryParams: { id: chatId } });
        this.dialogRef.close();
      } 
      else 
      {
        this.errorMessage.set('User not found or unable to start chat.');
      }
    } 
    catch (error) {
      console.error('New chat error:', error);

      if (error instanceof Error) 
      {
        this.errorMessage.set(error.message);
      } 
      else 
      {
        this.errorMessage.set('An unexpected error occurred. Please try again.');
      }
    }
  }
  
  onBackdropClick(event: MouseEvent) {
  // Optional: could restrict to left-click only
  if (event.target === event.currentTarget) {
    this.dialogRef.close();
  }
}
}
