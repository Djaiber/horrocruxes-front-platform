import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../core/auth/services/auth.service';

function passwordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const password = ctrl.get('password')?.value;
  const confirm  = ctrl.get('confirmPassword')?.value;
  return password === confirm ? null : { mismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    name:            ['', [Validators.required, Validators.minLength(2)]],
    email:           ['', [Validators.required, Validators.email]],
    birthdate:       ['', Validators.required],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  loading  = signal(false);
  error    = signal('');
  showPwd  = signal(false);
  readonly today = new Date().toISOString().split('T')[0];

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    this.loading.set(true);
    this.error.set('');

    try {
      await this.auth.signUp(
        this.form.value.email!,
        this.form.value.password!,
        this.form.value.name!,
        this.form.value.birthdate!,
      );
      this.router.navigate(['/auth/confirm'], {
        queryParams: { email: this.form.value.email },
      });
    } catch (e: any) {
      console.error('[register] Cognito error:', e);
      this.error.set(this.mapError(e));
    } finally {
      this.loading.set(false);
    }
  }

  private mapError(e: any): string {
    const code = e?.name ?? '';
    if (code === 'UsernameExistsException') return 'An account with that email already exists.';
    if (code === 'InvalidPasswordException') return 'The password does not meet security requirements.';
    return 'An error occurred. Please try again.';
  }

  get name()            { return this.form.controls.name; }
  get email()           { return this.form.controls.email; }
  get birthdate()       { return this.form.controls.birthdate; }
  get password()        { return this.form.controls.password; }
  get confirmPassword() { return this.form.controls.confirmPassword; }
  get mismatch()        { return this.form.errors?.['mismatch'] && this.confirmPassword.touched; }
}
