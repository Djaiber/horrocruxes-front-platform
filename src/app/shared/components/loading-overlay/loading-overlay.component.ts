import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    @if (visible()) {
      <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-hp-dark/80 backdrop-blur-sm animate-fade-in">
        <div class="relative">
          <div class="w-16 h-16 rounded-full border-2 border-hp-gold/20 border-t-hp-gold animate-spin"></div>
          <span class="absolute inset-0 flex items-center justify-center">
            <lucide-icon name="sparkles" class="w-6 h-6 text-hp-gold"></lucide-icon>
          </span>
        </div>
        @if (message()) {
          <p class="mt-4 text-hp-gold font-heading text-sm tracking-widest uppercase">{{ message() }}</p>
        }
      </div>
    }
  `,
})
export class LoadingOverlayComponent {
  visible = input(false);
  message = input('');
}
