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
  where,
} from '@angular/fire/firestore';
import {
  Auth,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { MatDialogModule } from '@angular/material/dialog';
import { useAuthStore } from '../../stores/auth.store';
import { ActivatedRoute } from '@angular/router';
import { useChatStore } from '../../stores/chat.store';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './chat-room.component.html',
  styleUrls: ['./chat-room.component.scss']
})
export class ChatRoomComponent implements OnInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private authStore = inject(useAuthStore);
  private chatStore = inject(useChatStore);

  newMessage: string = '';
  messages = signal<any[]>([]);
  userId: string = '';
  userEmail: string = '';
  user: any = { displayName: '' };
  chatId!: string;

  private hasLoadedMessages = false; // ✅ Prevents double loading

  constructor(private route: ActivatedRoute) {}

  getReceiverName(): string {
    const msgs = this.messages();
    const receiver = msgs.find(msg => msg.senderId !== this.userId);
    return receiver ? (receiver.senderName || receiver.senderEmail) : 'Chat';
  }

  async ngOnInit() 
  {
    //  Get user once, then load messages after auth & chatId are ready
    onAuthStateChanged(this.auth, async (user) => {
      if (user) 
        {
        this.userId = user.uid;
        this.userEmail = user.email ?? '';
        this.user = await this.authStore.getUserFromFirestore(user.uid);
        console.log(this.user);

        this.route.queryParams.subscribe(params => {
          this.chatId = params['id'];

          if (this.chatId && !this.hasLoadedMessages) 
          {
            this.loadMessages(); // ✅ Load only once
            this.hasLoadedMessages = true;
          }
        });
      }
    });
  }

  loadMessages() 
  {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', this.chatId),
      orderBy('timestamp')
    );

    onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => doc.data());
      this.messages.set(msgs);
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  async sendMessage() 
  {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    this.newMessage = ''; // ✅ Clear input instantly (prevents flicker or double input)

    const messageData = {
      senderId: this.user.uid,
      senderEmail: this.user.email,
      senderName: this.user.displayName,
      message: trimmed,
      timestamp: Timestamp.now(),
      chatId: this.chatId
    };

    try 
    {
      const messagesRef = collection(this.firestore, 'messages');
      await addDoc(messagesRef, messageData);
      this.scrollToBottom();
    } 
    catch (err) {
      console.error('Error sending message:', err);
    }
  }

  scrollToBottom(): void 
  {
    if (this.chatContainer) 
    {
      this.chatContainer.nativeElement.scrollTo({
        top: this.chatContainer.nativeElement.scrollHeight,
        // behavior: 'smooth'
      });
    }
  }

  isToday(date: Date): boolean 
  {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getDateFormat(timestamp: any): string 
  {
    const date = timestamp.toDate();
    return this.isToday(date) ? 'shortTime' : 'medium';
  }
}
