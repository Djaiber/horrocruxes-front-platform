import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LucideAngularModule,
  Zap, Eye, EyeOff, Star, Castle, Trash2, Wand, WandSparkles,
  LogOut, Sparkles, Check, Mail, RotateCcw, MessageCircle,
  PartyPopper, Shield, BookOpen, Moon,
} from 'lucide-angular';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(
      LucideAngularModule.pick({
        Zap, Eye, EyeOff, Star, Castle, Trash2, Wand, WandSparkles,
        LogOut, Sparkles, Check, Mail, RotateCcw, MessageCircle,
        PartyPopper, Shield, BookOpen, Moon,
      }),
    ),
  ],
};
