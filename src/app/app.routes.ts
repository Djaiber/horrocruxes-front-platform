import { Routes } from '@angular/router';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/chat/chat.routes').then((m) => m.CHAT_ROUTES),
  },
  {
    path: 'quiz',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/quiz/quiz.routes').then((m) => m.QUIZ_ROUTES),
  },
  { path: '**', redirectTo: '/chat' },
];
