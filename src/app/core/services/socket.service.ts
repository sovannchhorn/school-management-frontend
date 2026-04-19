import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private auth = inject(AuthService);

  notification$ = new Subject<any>();
  attendance$ = new Subject<any>();
  payment$ = new Subject<any>();

  connect() {
    const token = this.auth.token();
    if (!token || this.socket?.connected) return;

    this.socket = io(environment.socketUrl, { auth: { token }, transports: ['websocket'] });

    this.socket.on('notification', (data) => this.notification$.next(data));
    this.socket.on('attendanceMarked', (data) => this.attendance$.next(data));
    this.socket.on('paymentReceived', (data) => this.payment$.next(data));
    this.socket.on('connect_error', (err) => console.error('Socket error:', err));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data);
  }
}
