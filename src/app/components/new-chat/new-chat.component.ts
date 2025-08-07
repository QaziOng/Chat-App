// src/app/components/new-chat/new-chat.component.ts

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { useChatStore } from '../../stores/chat.store';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
} from '@angular/fire/firestore';
import { AppUser } from '../../stores/auth.store';
import {
  DynamicDialogRef,
  DynamicDialogConfig,
} from 'primeng/dynamicdialog';

@Component({
  selector: 'app-new-chat',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: 'new-chat.component.html',
  styleUrls: ['./new-chat.component.scss'],
})
export class NewChatComponent {
  errorMessage = signal<string | null>(null);
  searchQuery = '';
  searchPerformed = false;
  filteredUsers: AppUser[] = [];

  private chatStore = inject(useChatStore);
  private router = inject(Router);
  private firestore = inject(Firestore);

  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  async searchUsers(): Promise<void> {
    const queryText = this.searchQuery.trim();
    this.searchPerformed = true;

    if (!queryText) {
      this.filteredUsers = [];
      return;
    }

    try {
      const usersRef = collection(this.firestore, 'users');
      const displayNameQuery = query(
        usersRef,
        where('displayName', '>=', queryText),
        where('displayName', '<=', queryText + '\uf8ff')
      );

      const snapshot = await getDocs(displayNameQuery);
      const results = snapshot.docs.map(doc => doc.data() as AppUser);
      const currentUserId = this.chatStore.getCurrentUserId();
      this.filteredUsers = results.filter(user => user.uid !== currentUserId);

      if (this.filteredUsers.length === 0) {
        const emailQuery = query(usersRef, where('email', '==', this.searchQuery));
        const emailSnapshot = await getDocs(emailQuery);
        const emailResults = emailSnapshot.docs
          .map(doc => doc.data() as AppUser)
          .filter(user => user.uid !== currentUserId);
        this.filteredUsers = emailResults;
      }
    } catch (error) {
      console.error('Error searching users:', error);
      this.errorMessage.set('Error searching users. Please try again.');
      this.filteredUsers = [];
    }
  }

  async startChat(user: AppUser) {
    try {
      const chatId = await this.chatStore.createNewChat(user.email);
      if (chatId) {
        this.errorMessage.set(null);
        await this.router.navigate(['/home/chat'], { queryParams: { id: chatId } });
        this.dialogRef.close(); // ✅ Close PrimeNG dialog
      } else {
        this.errorMessage.set('User not found or unable to start chat.');
      }
    } catch (error) {
      console.error('New chat error:', error);
      if (error instanceof Error) {
        this.errorMessage.set(error.message);
      } else {
        this.errorMessage.set('An unexpected error occurred.');
      }
    }
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.dialogRef.close(); // ✅ Close on backdrop click
    }
  }
}
