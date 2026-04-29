import { Routes } from '@angular/router';

export const QUIZ_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/quiz-page/quiz-page.component').then((m) => m.QuizPageComponent),
  },
];
