import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule } from 'lucide-angular';
import { QuizAnswers, QUIZ_OPTIONS } from '../../../../shared/models/quiz.model';

@Component({
  selector: 'app-quiz-form',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './quiz-form.component.html',
})
export class QuizFormComponent {
  private fb = inject(FormBuilder);

  submitted = output<QuizAnswers>();

  readonly options = QUIZ_OPTIONS;
  readonly steps   = ['Personality', 'Hogwarts', 'Values'];
  readonly stepLabels = this.steps;
  currentStep      = signal(1);

  form = this.fb.group({
    reaccion_peligro: ['', Validators.required],
    valor_principal:  ['', Validators.required],
    rasgos:           this.fb.nonNullable.control<string[]>([], (c) => (c.value.length >= 1 ? null : { minSelected: true })),
    materia_favorita: ['', Validators.required],
    primer_anio:      ['', Validators.required],
    patronus:         ['', Validators.required],
    ante_injusticia:  ['', Validators.required],
    mayor_temor:      ['', Validators.required],
    lema_vida:        ['', [Validators.required, Validators.maxLength(120)]],
  });

  private stepFields: Record<number, string[]> = {
    1: ['reaccion_peligro', 'valor_principal', 'rasgos'],
    2: ['materia_favorita', 'primer_anio', 'patronus'],
    3: ['ante_injusticia', 'mayor_temor', 'lema_vida'],
  };

  next(): void {
    const fields = this.stepFields[this.currentStep()];
    if (fields.some((f) => this.form.get(f)?.invalid)) {
      fields.forEach((f) => this.form.get(f)?.markAsTouched());
      return;
    }
    this.currentStep.update((s) => s + 1);
  }

  back(): void { this.currentStep.update((s) => s - 1); }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitted.emit(this.form.getRawValue() as unknown as QuizAnswers);
  }

  toggleRasgo(rasgo: string): void {
    const current = this.form.controls.rasgos.value;
    const updated = current.includes(rasgo)
      ? current.filter((r) => r !== rasgo)
      : current.length < 4 ? [...current, rasgo] : current;
    this.form.controls.rasgos.setValue(updated);
    this.form.controls.rasgos.markAsTouched();
  }

  isRasgoSelected(rasgo: string): boolean {
    return this.form.controls.rasgos.value.includes(rasgo);
  }

  get lemaLength(): number { return (this.form.value.lema_vida ?? '').length; }

  isFieldInvalid(name: string): boolean {
    const ctrl = this.form.get(name);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  // ─── Dynamic classes (Tailwind doesn't support [class.x/y] with / or :) ────────

  radioOptionClass(current: string | null | undefined, value: string): string {
    return current === value
      ? 'flex items-center gap-3 p-3 rounded-lg border border-hp-gold bg-hp-raised cursor-pointer transition-all duration-200'
      : 'flex items-center gap-3 p-3 rounded-lg border border-hp-border cursor-pointer transition-all duration-200';
  }

  radioDotClass(current: string | null | undefined, value: string): string {
    return current === value
      ? 'w-4 h-4 rounded-full border-2 border-hp-gold bg-hp-gold flex-shrink-0'
      : 'w-4 h-4 rounded-full border-2 border-hp-border flex-shrink-0';
  }

  pillOptionClass(current: string | null | undefined, value: string): string {
    return current === value
      ? 'flex items-center justify-center p-3 rounded-lg border border-hp-gold bg-hp-raised text-hp-gold cursor-pointer transition-all duration-200 text-sm font-medium'
      : 'flex items-center justify-center p-3 rounded-lg border border-hp-border text-gray-400 cursor-pointer transition-all duration-200 text-sm font-medium';
  }

  chipClass(selected: boolean): string {
    return selected
      ? 'px-4 py-2 rounded-full border border-hp-gold bg-hp-raised text-hp-gold text-sm transition-all duration-200'
      : 'px-4 py-2 rounded-full border border-hp-border text-gray-400 text-sm transition-all duration-200';
  }
}
