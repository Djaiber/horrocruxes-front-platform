import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { QuizResult } from '../../../../shared/models/quiz.model';

const CASA_COLORS: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  Gryffindor: { bg: 'bg-red-900/20',    text: 'text-red-400',    border: 'border-red-700/40',    icon: 'shield' },
  Slytherin:  { bg: 'bg-green-900/20',  text: 'text-green-400',  border: 'border-green-700/40',  icon: 'moon' },
  Hufflepuff: { bg: 'bg-yellow-900/20', text: 'text-yellow-400', border: 'border-yellow-700/40', icon: 'star' },
  Ravenclaw:  { bg: 'bg-blue-900/20',   text: 'text-blue-400',   border: 'border-blue-700/40',   icon: 'sparkles' },
};

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  templateUrl: './quiz-result.component.html',
})
export class QuizResultComponent {
  result = input.required<QuizResult>();
  retake = output<void>();

  getCasaStyle(casa: string) {
    return CASA_COLORS[casa] ?? CASA_COLORS['Gryffindor'];
  }
}
