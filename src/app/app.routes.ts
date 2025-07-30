import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { NewChatComponent } from './components/new-chat/new-chat.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';
import { ChatLayoutComponent } from './components/chat-layout/chat-layout.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent,
    },
    {
        path: 'signup',
        component: SignupComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'new-chat',
        component: NewChatComponent,
    },
    {
        path: 'chat-list',
        component: ChatListComponent,
    },
    {
        path: 'chat-room/:chatId', // Real-time chat route
        loadComponent: () =>
            import('./components/chat-room/chat-room.component').then(
                (m) => m.ChatRoomComponent
            ),
    },
    {
        path: 'home',
        loadComponent: () =>
            import('./components/chat-layout/chat-layout.component').then(
                (m) => m.ChatLayoutComponent
            ),
        children: [
            {
                path: '',
                redirectTo: 'chat',
                pathMatch: 'full'
            },
            {
                path: 'chat',
                loadComponent: () =>
                    import('./components/chat-room/chat-room.component').then(
                        (m) => m.ChatRoomComponent
                    ),
            }
        ]
    }
];
