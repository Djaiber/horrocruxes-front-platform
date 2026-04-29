import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { QuizAnswers, QuizResult } from '../../../shared/models/quiz.model';
import { environment } from '../../../../environments/environment';

const RESULT_KEY = 'hp_quiz_result';

@Injectable({ providedIn: 'root' })
export class QuizService {
  private http = inject(HttpClient);

  private readonly _result  = signal<QuizResult | null>(this.loadResult());
  private readonly _loading = signal(false);
  private readonly _error   = signal('');

  readonly result  = this._result.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error   = this._error.asReadonly();

  async analyze(answers: QuizAnswers): Promise<QuizResult> {
    this._loading.set(true);
    this._error.set('');

    try {
      const result = await firstValueFrom(
        this.http.post<QuizResult>(`${environment.apiUrl}/quiz/analyze`, answers),
      );
      this.saveResult(result);
      return result;
    } catch {
      // Mock while the backend isn't ready
      const mock = this.mockResult(answers);
      this.saveResult(mock);
      return mock;
    } finally {
      this._loading.set(false);
    }
  }

  clearResult(): void {
    localStorage.removeItem(RESULT_KEY);
    this._result.set(null);
  }

  private saveResult(result: QuizResult): void {
    localStorage.setItem(RESULT_KEY, JSON.stringify(result));
    this._result.set(result);
  }

  private loadResult(): QuizResult | null {
    try {
      const raw = localStorage.getItem(RESULT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  private mockResult(answers: QuizAnswers): QuizResult {
    const valor = answers.valor_principal;
    const map: Record<string, QuizResult> = {
      valentia: {
        personaje: 'Harry Potter',
        casa: 'Gryffindor',
        descripcion: 'Your unwavering courage and bravery define you. When danger threatens, you don\'t hesitate to face it head-on, even when all seems lost.',
        match_percentage: 88,
        traits: ['Brave', 'Loyal', 'Determined', 'Protective'],
        quote: '«It doesn\'t matter that you\'re The Chosen One — what matters is what you do with that destiny.»',
      },
      inteligencia: {
        personaje: 'Hermione Granger',
        casa: 'Gryffindor',
        descripcion: 'Your brilliant mind and love of knowledge are your greatest strength. You trust in logic and preparation to solve any problem.',
        match_percentage: 91,
        traits: ['Intelligent', 'Perfectionist', 'Loyal', 'Empathetic'],
        quote: '«Luck has nothing to do with it. Hard work and studying are what matter.»',
      },
      lealtad: {
        personaje: 'Ron Weasley',
        casa: 'Gryffindor',
        descripcion: 'Loyalty is your deepest value. You never abandon those you love and your friendship is a treasure that few are privileged to receive.',
        match_percentage: 85,
        traits: ['Loyal', 'Fun', 'Brave', 'Generous'],
        quote: '«Why is it always me? Well, someone has to do it.»',
      },
      ambicion: {
        personaje: 'Draco Malfoy',
        casa: 'Slytherin',
        descripcion: 'Your ambition and determination always drive you to the top. You know what you want and won\'t stop until you get it, even if the path is sometimes complex.',
        match_percentage: 82,
        traits: ['Ambitious', 'Strategic', 'Intelligent', 'Determined'],
        quote: '«Power is not begged for — it is taken.»',
      },
    };
    return map[valor] ?? map['valentia'];
  }
}
