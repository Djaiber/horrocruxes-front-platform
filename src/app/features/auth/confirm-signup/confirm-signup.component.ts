import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-confirm-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './confirm-signup.component.html',
})
export class ConfirmSignupComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  emailFromQuery = this.route.snapshot.queryParamMap.get('email') ?? '';

  form = this.fb.group({
    email: [this.emailFromQuery, [Validators.required, Validators.email]],
    code:  ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  loading  = signal(false);
  error    = signal('');
  success  = signal(false);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.confirmSignUp(this.form.value.email!, this.form.value.code!);
      this.success.set(true);
      setTimeout(() => this.router.navigate(['/auth/login']), 2000);
    } catch (e: any) {
      this.error.set(this.mapError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private mapError(e: any): string {
    const code = e?.name ?? '';
    if (code === 'CodeMismatchException')   return 'Incorrect code. Check your email.';
    if (code === 'ExpiredCodeException')    return 'The code expired. Request a new one.';
    return 'An error occurred. Please try again.';
  }

  get email() { return this.form.controls.email; }
  get code()  { return this.form.controls.code; }
}
