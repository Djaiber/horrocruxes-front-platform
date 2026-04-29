import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = signal(false);
  error   = signal('');
  showPwd = signal(false);

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.signIn(this.form.value.email!, this.form.value.password!);
      this.router.navigate(['/chat']);
    } catch (e: any) {
      console.error('[login] Cognito error:', e);
      this.error.set(this.mapError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private mapError(e: any): string {
    const code = e?.name ?? '';
    if (code === 'NotAuthorizedException') return 'Incorrect email or password.';
    if (code === 'UserNotFoundException')  return 'No account exists with that email.';
    if (code === 'UserNotConfirmedException') return 'You must confirm your account first.';
    return 'An error occurred. Please try again.';
  }

  get email()    { return this.form.controls.email; }
  get password() { return this.form.controls.password; }
}
