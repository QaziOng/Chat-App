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

import { Component, OnInit, inject, signal } from '@angular/core';
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

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  newMessage: string = '';
  messages = signal<any[]>([]);
  userId: string = '';
  userEmail: string = '';

  ngOnInit() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email ?? '';
        this.loadMessages();
      }
    });
  }

  loadMessages() {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));
    onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      this.messages.set(msgs);
    });
  }

  async sendMessage() {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    const messageData = {
      senderId: this.userId,
      senderEmail: this.userEmail,
      message: trimmed,
      timestamp: Timestamp.now()
    };

    try {
      const messagesRef = collection(this.firestore, 'messages');
      await addDoc(messagesRef, messageData);
      this.newMessage = '';
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }
}
