import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { NewChatComponent } from './components/new-chat/new-chat.component';
import { ChatListComponent } from './components/chat-list/chat-list.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component: HomeComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'chat',
        component: NewChatComponent
    },
    {
        path: 'chat/:chatId',  // handles dynamic chatId like 'chat/gSmkedYhU3pimSiEyEKp'
        component: NewChatComponent
    },
    {
        path: 'chat-list',
        component: ChatListComponent
    },
    {
        path: 'chat-list/:chatId',  // handles 'chat-list/someId'
        component: ChatListComponent
    }
];
