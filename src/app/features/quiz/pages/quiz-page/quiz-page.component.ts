import { Component, inject, signal } from '@angular/core';
import { QuizService } from '../../services/quiz.service';
import { QuizFormComponent } from '../../components/quiz-form/quiz-form.component';
import { QuizResultComponent } from '../../components/quiz-result/quiz-result.component';
import { LoadingOverlayComponent } from '../../../../shared/components/loading-overlay/loading-overlay.component';
import { QuizAnswers } from '../../../../shared/models/quiz.model';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-quiz-page',
  standalone: true,
  imports: [QuizFormComponent, QuizResultComponent, LoadingOverlayComponent, RouterLink, LucideAngularModule],
  templateUrl: './quiz-page.component.html',
})
export class QuizPageComponent {
  private quizService = inject(QuizService);

  readonly loading = this.quizService.loading;
  readonly result  = this.quizService.result;

  showForm = signal(!this.quizService.result());

  async onSubmit(answers: QuizAnswers): Promise<void> {
    await this.quizService.analyze(answers);
    this.showForm.set(false);
  }

  retake(): void {
    this.quizService.clearResult();
    this.showForm.set(true);
  }
}
