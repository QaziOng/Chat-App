import { Component, inject } from '@angular/core';
import { ChatListComponent } from '../chat-list/chat-list.component';
import { RouterModule } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
@Component({
  selector: 'app-chat-layout',
  standalone: true,
  imports: [ChatListComponent, RouterModule, MatDialogModule],
  templateUrl: './chat-layout.component.html',
  styleUrl: './chat-layout.component.scss'
})
export class ChatLayoutComponent {

  

  private auth = inject(Auth);

  async ngOnInit() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
       
      }
    });
  }
}
