# Software Design Document (SDD)
## Plataforma Chatbot Harry Potter — Horrocruxes

**Versión:** 2.1  
**Fecha:** 2026-04-28  
**Stack:** Angular + Tailwind CSS + Amazon Cognito

---

## 1. Visión General

Plataforma web que permite a usuarios autenticados vía Amazon Cognito:
- Mantener múltiples conversaciones con un chatbot temático de Harry Potter
- Elegir el personaje/tono del chatbot (configuración que se envía al backend)
- Descubrir qué personaje del universo HP son mediante un cuestionario inteligente (LLM)

---

## 2. Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend | Angular 19 + TypeScript (strict mode) |
| UI | Tailwind CSS v4 |
| Estado | Signals (`signal`, `computed`, `effect`) |
| Auth | Amazon Cognito — `@aws-sdk/client-cognito-identity-provider` |
| HTTP | Angular `HttpClient` + interceptor funcional |
| Routing | Angular Router (standalone, lazy loading) |
| Componentes UI | shadcn-like custom components con Tailwind |
| Forms | Reactive Forms (`FormBuilder`, validators) |
| Backend | A definir (FastAPI — pendiente) |
| LLM | A definir por backend |

---

## 3. Arquitectura del Sistema

```
┌────────────────────────────────────────────────────────────┐
│                    FRONTEND (Angular 19)                    │
│                                                            │
│   features/auth   features/chat   features/quiz           │
│        │               │               │                  │
│        └───────────────┴───────────────┘                  │
│                        │                                   │
│              core/auth (Cognito SDK)                       │
│              core/interceptor (Bearer token)               │
└───────────────────────┬────────────────────────────────────┘
                        │ REST API + Bearer JWT
              ┌─────────▼─────────┐
              │  Backend (TBD)    │
              │  FastAPI          │
              └─────────┬─────────┘
                        │
              ┌─────────▼─────────┐
              │  Amazon Cognito   │  ← Auth directa desde frontend
              │  us-east-1        │
              └───────────────────┘
```

---

## 4. Estructura de Proyecto Angular

Basada en **Feature-based architecture** con **Standalone Components** y sin NgModules.

```
src/
├── environments/
│   ├── environment.ts           ← Cognito config (dev)
│   └── environment.prod.ts      ← Cognito config (prod)
│
└── app/
    ├── app.component.ts         ← Root standalone component
    ├── app.routes.ts            ← Rutas top-level + lazy loading
    │
    ├── core/                    ← Singleton: servicios globales, guards, interceptors
    │   └── auth/
    │       ├── services/
    │       │   └── auth.service.ts
    │       ├── guards/
    │       │   └── auth.guard.ts
    │       └── interceptors/
    │           └── auth.interceptor.ts
    │
    ├── features/                ← Un folder por feature, lazy-loaded
    │   ├── auth/
    │   │   ├── auth.routes.ts
    │   │   ├── login/
    │   │   │   ├── login.component.ts
    │   │   │   └── login.component.html
    │   │   ├── register/
    │   │   │   ├── register.component.ts
    │   │   │   └── register.component.html
    │   │   └── confirm-signup/
    │   │       ├── confirm-signup.component.ts
    │   │       └── confirm-signup.component.html
    │   │
    │   ├── chat/
    │   │   ├── chat.routes.ts
    │   │   ├── pages/
    │   │   │   └── chat-page/
    │   │   │       ├── chat-page.component.ts
    │   │   │       └── chat-page.component.html
    │   │   ├── components/
    │   │   │   ├── chat-sidebar/
    │   │   │   ├── chat-window/
    │   │   │   ├── message-bubble/
    │   │   │   └── chat-input/
    │   │   └── services/
    │   │       └── chat.service.ts
    │   │
    │   └── quiz/
    │       ├── quiz.routes.ts
    │       ├── pages/
    │       │   └── quiz-page/
    │       │       ├── quiz-page.component.ts
    │       │       └── quiz-page.component.html
    │       ├── components/
    │       │   ├── quiz-form/
    │       │   └── quiz-result/
    │       └── services/
    │           └── quiz.service.ts
    │
    └── shared/                  ← Componentes/pipes usados en múltiples features
        ├── components/
        │   ├── loading-overlay/
        │   └── hp-avatar/
        └── models/
            ├── user.model.ts
            ├── chat.model.ts
            └── quiz.model.ts
```

---

## 5. Amazon Cognito — Configuración

| Parámetro | Valor |
|-----------|-------|
| Region | `us-east-1` |
| User Pool ID | `us-east-1_VmpTThD7q` |
| Client ID | `1htoo8ovmebc0mr97q50lcit86` |
| Auth Flows | USER_PASSWORD_AUTH, USER_SRP_AUTH, REFRESH_TOKEN_AUTH |
| Client Secret | Ninguno (public client) |
| Token Storage | `localStorage` |

**Tokens almacenados en localStorage:**
- `access_token` — Bearer para las APIs, expira en 1h
- `id_token` — Info del usuario (email, name)
- `refresh_token` — Renueva la sesión (30 días)
- `expires_at` — Timestamp para saber si expiró

---

## 6. Rutas de la Aplicación

```typescript
// app.routes.ts
[
  { path: '', redirectTo: '/chat', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes'),
    // /auth/login | /auth/register | /auth/confirm
  },
  {
    path: 'chat',
    canActivate: [authGuard],
    loadChildren: () => import('./features/chat/chat.routes'),
    // /chat | /chat/:chatId
  },
  {
    path: 'quiz',
    canActivate: [authGuard],
    loadChildren: () => import('./features/quiz/quiz.routes'),
    // /quiz | /quiz/result
  },
]
```

---

## 7. Feature: Auth

### Flujos

**Register:**
```
/auth/register → signUp(email, password, name) → Cognito
→ Redirect /auth/confirm?email=xxx
→ confirmSignUp(email, code) → Redirect /auth/login
```

**Login:**
```
/auth/login → signIn(email, password) → Cognito
→ Guarda tokens en localStorage → Redirect /chat
```

**Forgot Password:**
```
forgotPassword(email) → Cognito envía código
→ confirmForgotPassword(email, code, newPassword) → Redirect /auth/login
```

---

## 8. Feature: Chat

### Layout

```
┌─────────────────────────────────────────────────────┐
│ SIDEBAR (280px fixo)      │  CHAT WINDOW            │
│                           │                         │
│ [+ Nueva conversación]    │  ┌─────────────────┐   │
│ ─────────────────────     │  │ msg usuario     │   │
│ ▶ Búsqueda del Horcrux   │  └─────────────────┘   │
│   La Cámara Secreta...    │  ┌─────────────────┐   │
│   Dumbledore me dijo...   │  │ respuesta bot   │   │
│                           │  └─────────────────┘   │
│ ─────────────────────     │                         │
│ [¿Qué personaje eres?]   │  ─────────────────────  │
│ [Cerrar sesión]           │  [Escribe tu mensaje]  │
└───────────────────────────────────────────────────-─┘
```

### Selección de Personaje del Bot

El usuario puede elegir con quién "habla" — esto configura el `system_prompt` que el frontend envía al backend:

| Personaje | Tono |
|-----------|------|
| Albus Dumbledore | Sabio, filosófico, enigmático |
| Hermione Granger | Preciso, informativo, un poco condescendiente |
| Ron Weasley | Casual, humorístico, leal |
| Severus Snape | Sarcástico, frío, brillante |
| Luna Lovegood | Soñador, peculiar, ingenioso |

Esta selección se guarda en `localStorage` y se envía como campo `character` en cada request al backend.

---

## 9. Feature: Quiz — ¿Qué personaje de HP eres?

### Preguntas del Formulario

**Paso 1 de 3 — Personalidad**

| # | Pregunta | Tipo | Opciones |
|---|----------|------|---------|
| 1 | ¿Cómo reaccionas ante un peligro inesperado? | Radio | Enfrento de inmediato / Analizo antes de actuar / Busco ayuda / Improviso en el momento |
| 2 | ¿Qué valor describes como el más importante? | Radio | Valentía / Lealtad / Inteligencia / Ambición |
| 3 | Tus amigos te describirían como... | Chips multi-select | Protector, Curioso, Divertido, Estratégico, Empático, Intenso |

**Paso 2 de 3 — Hogwarts**

| # | Pregunta | Tipo | Opciones |
|---|----------|------|---------|
| 4 | ¿Qué materia disfrutarías más? | Select | Defensa contra las Artes Oscuras / Pociones / Transfiguración / Adivinación / Encantamientos |
| 5 | ¿Qué harías en tu primer año en Hogwarts? | Radio | Explorar pasillos prohibidos / Memorizar todos los libros / Hacer amigos en todas las casas / Planear cómo destacar |
| 6 | ¿Cuál sería tu patronus ideal? | Select | Ciervo / Nutria / Terrier / Gamo / Liebre / Fénix |

**Paso 3 de 3 — Valores**

| # | Pregunta | Tipo | Opciones |
|---|----------|------|---------|
| 7 | Ante una injusticia, tú... | Radio | La enfrentas aunque sea peligroso / La analizas y buscas la solución correcta / Proteges a los más débiles / La usas a tu favor |
| 8 | ¿Cuál es tu mayor temor? | Radio | Perder a quienes amas / No ser lo suficientemente bueno / El fracaso / La mediocridad |
| 9 | En una frase, ¿cuál es tu lema de vida? | Textarea | (libre, máx 120 chars) |

### Flujo del Quiz

```
/quiz → Stepper 3 pasos → Validación por paso
→ Submit → POST /quiz/analyze { respuestas }
→ Backend → Claude API → JSON resultado
→ /quiz/result → Tarjeta animada con personaje
→ Guardar en perfil del usuario
```

### Resultado esperado del LLM

```json
{
  "personaje": "Hermione Granger",
  "casa": "Gryffindor",
  "descripcion": "Tu sed de conocimiento y tu lealtad inquebrantable...",
  "match_percentage": 89,
  "traits": ["Inteligente", "Valiente", "Leal", "Perfeccionista"],
  "quote": "«La suerte no tiene nada que ver. El trabajo duro y el estudio son lo que importa.»"
}
```

---

## 10. Modelos TypeScript

```typescript
// shared/models/user.model.ts
export interface User {
  id: string;
  email: string;
  name: string;
}

// shared/models/chat.model.ts
export interface Chat {
  id: string;
  title: string;
  character: HpCharacter;
  createdAt: Date;
  lastMessageAt: Date;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export type HpCharacter = 'dumbledore' | 'hermione' | 'ron' | 'snape' | 'luna';

// shared/models/quiz.model.ts
export interface QuizAnswers {
  reaccion_peligro: string;
  valor_principal: string;
  rasgos: string[];
  materia_favorita: string;
  primer_anio: string;
  patronus: string;
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
```

---

## 11. API Backend (Pendiente de implementar)

### Endpoints esperados

```
POST  /auth/verify-token           Verifica token Cognito (opcional)

GET   /chats                       Lista chats del usuario
POST  /chats                       Crea chat nuevo
GET   /chats/:id/messages          Mensajes de un chat
POST  /chats/:id/messages          Envía mensaje → respuesta LLM
DELETE /chats/:id                  Elimina chat

POST  /quiz/analyze                Analiza quiz → respuesta LLM
GET   /quiz/results                Historial de resultados
```

### Headers esperados en todas las requests

```
Authorization: Bearer <cognito_access_token>
Content-Type: application/json
```

---

## 12. Seguridad Frontend

| Aspecto | Implementación |
|---------|---------------|
| Tokens | localStorage con `expires_at` para validación |
| Rutas protegidas | `authGuard` funcional — intenta refresh antes de denegar |
| Requests | Interceptor adjunta Bearer automáticamente |
| Token expirado | Interceptor captura 401 → llama `refreshSession()` → reintenta |
| Signout | `GlobalSignOutCommand` invalida sesión en Cognito |

---

## 13. Roadmap Hackathon (Solo dev)

| Orden | Tarea | Tiempo estimado |
|-------|-------|-----------------|
| 1 | Setup Angular + Material + estructura de carpetas | 30 min |
| 2 | environment.ts + auth.service.ts + guard + interceptor | 45 min |
| 3 | Login page + Register page + Confirm page | 1h |
| 4 | Chat layout (sidebar + window skeleton) | 1h |
| 5 | Integración real con backend (mensajes) | 1h |
| 6 | Quiz form (stepper 3 pasos) | 45 min |
| 7 | Quiz result card | 30 min |
| 8 | Estilos temáticos HP (colores Hogwarts, fuentes) | 30 min |
| 9 | Polish: loading states, errores, responsive | 30 min |
