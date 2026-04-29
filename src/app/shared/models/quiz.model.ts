export interface QuizAnswers {
  // Step 1
  reaccion_peligro: string;
  valor_principal: string;
  rasgos: string[];
  // Step 2
  materia_favorita: string;
  primer_anio: string;
  patronus: string;
  // Step 3
  ante_injusticia: string;
  mayor_temor: string;
  lema_vida: string;
}

export interface QuizResult {
  personaje: string;
  casa: string;
  descripcion: string;
  match_percentage: number;
  traits: string[];
  quote: string;
}

export const QUIZ_OPTIONS = {
  reaccion_peligro: [
    { value: 'enfrentar',   label: 'I face it immediately' },
    { value: 'analizar',    label: 'I analyze before acting' },
    { value: 'ayuda',       label: 'I seek help' },
    { value: 'improvisar',  label: 'I improvise in the moment' },
  ],
  valor_principal: [
    { value: 'valentia',      label: 'Courage' },
    { value: 'lealtad',       label: 'Loyalty' },
    { value: 'inteligencia',  label: 'Intelligence' },
    { value: 'ambicion',      label: 'Ambition' },
  ],
  rasgos: [
    'Protective', 'Curious', 'Fun', 'Strategic', 'Empathetic', 'Intense', 'Creative', 'Brave',
  ],
  materia_favorita: [
    { value: 'defensa',         label: 'Defense Against the Dark Arts' },
    { value: 'pociones',        label: 'Potions' },
    { value: 'transfiguracion', label: 'Transfiguration' },
    { value: 'adivinacion',     label: 'Divination' },
    { value: 'encantamientos',  label: 'Charms' },
  ],
  primer_anio: [
    { value: 'explorar',    label: 'Explore forbidden corridors' },
    { value: 'estudiar',    label: 'Memorize every book' },
    { value: 'amigos',      label: 'Make friends across all houses' },
    { value: 'destacar',    label: 'Plan how to stand out' },
  ],
  patronus: [
    { value: 'ciervo',   label: 'Stag' },
    { value: 'nutria',   label: 'Otter' },
    { value: 'terrier',  label: 'Jack Russell Terrier' },
    { value: 'liebre',   label: 'Hare' },
    { value: 'fenix',    label: 'Phoenix' },
    { value: 'lobo',     label: 'Wolf' },
  ],
  ante_injusticia: [
    { value: 'enfrentar',  label: 'I face it even if dangerous' },
    { value: 'resolver',   label: 'I analyze and seek the right solution' },
    { value: 'proteger',   label: 'I protect the vulnerable' },
    { value: 'aprovechar', label: 'I use it to my advantage' },
  ],
  mayor_temor: [
    { value: 'perder',     label: 'Losing those I love' },
    { value: 'insuficiente', label: 'Not being good enough' },
    { value: 'fracaso',    label: 'Failure' },
    { value: 'mediocridad', label: 'Mediocrity' },
  ],
} as const;
