import { createInjectable } from 'ngxtension/create-injectable';
import { inject, signal, computed, effect } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  Timestamp,
  query,
  where,
  getDocs,
  orderBy,
  getDoc,
} from '@angular/fire/firestore';

import { useAuthStore, AppUser } from './auth.store';

export interface Chat {
  id: string;
  participants: string[];
  participantNames?: string[];
  participantsKey?: string;
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
}

export const useChatStore = createInjectable(() => {
  const firestore = inject(Firestore);
  const authStore = inject(useAuthStore);

  const chats = signal<Chat[]>([]);
  const currentChatId = signal<string | null>(null);
  const messages = signal<Message[]>([]);

  let messageUnsubscribe: (() => void) | null = null;

  const currentChat = computed(() =>
    chats().find((chat) => chat.id === currentChatId())
  );

  effect(() => {
    const userId = authStore.currentUser()?.uid;
    if (userId) {
      listenToChats(userId);
    }
  });

  /** 🔍 Get user info by UID */
  async function getUserByUid(uid: string): Promise<AppUser | null> {
    const docRef = doc(firestore, `users/${uid}`);
    const snap = await getDoc(docRef);
    return snap.exists() ? (snap.data() as AppUser) : null;
  }

  /** 🔍 Get user info by email */
  async function getUserByEmail(email: string): Promise<AppUser | null> {
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where('email', '==', email));
    const snap = await getDocs(q);
    return snap.empty ? null : (snap.docs[0].data() as AppUser);
  }

  /** 🧠 Get readable name of a user */
  async function getUserName(userId: string): Promise<string> {
    const user = await getUserByUid(userId);
    return user?.displayName || user?.email || 'Unknown User';
  }

  async function fetchParticipantNames(participantIds: string[]): Promise<string[]> {
    return await Promise.all(participantIds.map(getUserName));
  }

  /** 📡 Listen to chats in real-time */
  function listenToChats(userId: string) {
    const chatsRef = collection(firestore, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', userId));

    return onSnapshot(q, async (snapshot) => {
      const updatedChats = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const chatData = { id: docSnap.id, ...docSnap.data() } as Chat;
          chatData.participantNames = await fetchParticipantNames(chatData.participants);
          return chatData;
        })
      );
      chats.set(updatedChats);
    });
  }

  /** 📡 Listen to messages in a specific chat */
  function listenToMessages(chatId: string) {
    currentChatId.set(chatId);

    if (messageUnsubscribe) {
      messageUnsubscribe();
    }

    const messagesRef = collection(firestore, `chats/${chatId}/messages`);
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    messageUnsubscribe = onSnapshot(q, (snapshot) => {
      const updatedMessages = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Message)
      );
      messages.set(updatedMessages);
    });
  }

  /** 💬 Send a message to a chat */
  async function sendMessage(chatId: string, senderId: string, text: string) {
    debugger
    const messagesRef = collection(firestore, `chats/${chatId}/messages`);

    await addDoc(messagesRef, {
      chatId,
      senderId,
      text,
      timestamp: Timestamp.now(),
    });

    await updateDoc(doc(firestore, `chats/${chatId}`), {
      lastMessage: text,
      lastMessageTimestamp: Timestamp.now(),
    });
  }

  /** 🔁 Start or reuse existing chat with another user (by email or uid) */
  async function createNewChat(participantEmailOrUid: string): Promise<string> {
    const currentUser = authStore.currentUser();
    if (!currentUser) throw new Error('You must be logged in to start a chat');

    // 🔍 Support both email or uid
    const isEmail = participantEmailOrUid.includes('@');
    const participantUser = isEmail
      ? await getUserByEmail(participantEmailOrUid)
      : await getUserByUid(participantEmailOrUid);

    if (!participantUser) throw new Error('User not found');
    if (participantUser.uid === currentUser.uid)
      throw new Error('You cannot chat with yourself');

    const participants = [currentUser.uid, participantUser.uid];
    const participantsKey = [...participants].sort().join('_');

    // 🧾 Check if chat already exists
    const chatsRef = collection(firestore, 'chats');
    const existingQuery = query(chatsRef, where('participantsKey', '==', participantsKey));
    const existingSnap = await getDocs(existingQuery);

    if (!existingSnap.empty) {
      return existingSnap.docs[0].id;
    }

    // 💥 Create new chat
    const newChat = await addDoc(chatsRef, {
      participants,
      participantsKey,
      lastMessage: '',
      lastMessageTimestamp: Timestamp.now(),
    });

    return newChat.id;
  }

  function getCurrentUserId(): string | null {
    return authStore.currentUser()?.uid || null;
  }

  return {
    chats,
    currentChat,
    messages,
    listenToChats,
    listenToMessages,
    sendMessage,
    createNewChat,
    getUserName,
    getCurrentUserId
  };
});
