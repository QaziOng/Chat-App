// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-chat-room',
//   standalone: true,
//   imports: [],
//   templateUrl: './chat-room.component.html',
//   styleUrl: './chat-room.component.scss'
// })
// export class ChatRoomComponent {
// }

import { Component, ElementRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  query,
  orderBy,
  addDoc,
  onSnapshot,
  Timestamp,
} from '@angular/fire/firestore';
import {
  Auth,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { collectionData } from '@angular/fire/firestore';
import { useAuthStore } from '../../stores/auth.store';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private authStore = inject(useAuthStore)

  newMessage: string = '';
  messages = signal<any[]>([]);
  userId: string = '';
  userEmail: string = '';
  user: any = {
    displayName: ''
  }

  async ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email ?? '';
        this.user = user;
        this.loadMessages();
        this.user = await this.authStore.getUserFromFirestore(user.uid)
        console.log(this.user)
      }
    });

  }

  ngAfterViewInit(): void {
  }

  loadMessages() {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      this.messages.set(msgs);
      setTimeout(() => {
        this.scrollToBottom()
      }, 200)
    });
  }

  async sendMessage() {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    const messageData = {
      senderId: this.user.uid,
      senderEmail: this.user.email,
      senderName: this.user.displayName,
      message: trimmed,
      timestamp: Timestamp.now()
    };

    try {
      const messagesRef = collection(this.firestore, 'messages');
      await addDoc(messagesRef, messageData);
      this.newMessage = '';
      this.scrollToBottom()
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
