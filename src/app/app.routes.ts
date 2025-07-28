import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { NewChatComponent } from './components/new-chat/new-chat.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        component:HomeComponent
    },
    {
        path: 'signup',
        component:SignupComponent
    },
    {
        path: 'login',
        component:LoginComponent
    },
    // {
    //     path: 'home',
    //     component:HomeComponent
    // },
    {
        path: 'chat',
        component:NewChatComponent
    }

];
