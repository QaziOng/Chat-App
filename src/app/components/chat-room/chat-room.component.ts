import {
  Component,
  ElementRef,
  OnInit,
  AfterViewInit,
  ViewChild,
  inject,
  signal,
  effect,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Firestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
} from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { ActivatedRoute } from '@angular/router';
import { useAuthStore } from '../../stores/auth.store';
import { useChatStore } from '../../stores/chat.store';

@Component({
  selector: 'app-chat-room',
  standalone: true,
  imports: [CommonModule, FormsModule],
  styleUrls: ['./chat-room.component.scss'],
  templateUrl: './chat-room.component.html',
})
export class ChatRoomComponent implements OnInit, AfterViewInit {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;

  // Angular injectors
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);
  private authStore = inject(useAuthStore);
  private chatStore = inject(useChatStore);
  private destroyRef = inject(DestroyRef); // Angular 16+ for cleanup

  newMessage = '';
  messages = signal<any[]>([]);

  userId = '';
  userEmail = '';
  user: any = { displayName: '', email: '', uid: '' };

  chatId = '';
  private unsubscribeSnapshot: () => void = () => {};

  ngOnInit(): void {
    // Load chat ID from URL query params
    this.route.queryParams.subscribe((params) => {
      this.chatId = params['id'];
      this.loadMessages();
    });

    // Auth state watcher
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        this.userId = user.uid;
        this.userEmail = user.email ?? '';
        this.user = await this.authStore.getUserFromFirestore(user.uid);
      }
    });
  }

  ngAfterViewInit(): void {
    effect(() => {
      // Auto-scroll when messages update
      this.messages();
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from Firestore listener
    if (this.unsubscribeSnapshot) this.unsubscribeSnapshot();
  }

  loadMessages(): void {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', this.chatId),
      orderBy('timestamp')
    );

    this.unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => doc.data());
      const grouped = this.groupMessages(msgs);
      this.messages.set(grouped);
    });
  }

  groupMessages(msgs: any[]): any[] {
    return msgs.map((msg, i, arr) => {
      const prev = arr[i - 1];
      const next = arr[i + 1];

      const isSameSenderAsPrev = prev?.senderId === msg.senderId;
      const isSameSenderAsNext = next?.senderId === msg.senderId;

      return {
        ...msg,
        isFirstInGroup: !isSameSenderAsPrev && isSameSenderAsNext,
        isMiddleInGroup: isSameSenderAsPrev && isSameSenderAsNext,
        isLastInGroup: isSameSenderAsPrev && !isSameSenderAsNext,
        isSingle: !isSameSenderAsPrev && !isSameSenderAsNext,
      };
    });
  }

  async sendMessage(): Promise<void> {
    const trimmed = this.newMessage.trim();
    if (!trimmed) return;

    const messageData = {
      senderId: this.user.uid,
      senderEmail: this.user.email,
      senderName: this.user.displayName,
      message: trimmed,
      timestamp: Timestamp.now(),
      chatId: this.chatId,
    };

    try {
      await this.chatStore.sendMessage(messageData);
      this.newMessage = '';
    } catch (err) {
      console.error('Error sending message:', err);
    }
  }

  scrollToBottom(): void {
    if (this.chatContainer) {
      const el = this.chatContainer.nativeElement;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }

  getReceiverName(): string {
    const msgs = this.messages();
    const receiver = msgs.find((msg) => msg.senderId !== this.userId);
    return receiver?.senderName || receiver?.senderEmail || 'Chat';
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  getDateFormat(timestamp: any): string {
    const date = timestamp?.toDate?.();
    if (!date) return '';
    return this.isToday(date) ? 'shortTime' : 'medium';
  }
}
