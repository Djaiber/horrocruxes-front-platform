# Horrocruxes

Harry Potter themed chat app. Talk with iconic HP characters powered by a multiagent AI system.

## Features

- **Character chat** — conversations with Dumbledore, Hermione, Ron, Snape or Luna, each with their own personality
- **HP Quiz** — 9-question personality test to find your matching character
- **Auth** — register/login via AWS Cognito

## Tech

- Angular 19 · Tailwind CSS · Lucide icons
- AWS Cognito (authentication)
- FastAPI + PostgreSQL (backend — see `SDD_BACKEND.md`)
- NVIDIA API / Gemma 4 31B (LLM with tool use)
- Lambda multiagent system (deep HP knowledge base)

## Setup

```bash
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
# fill in your Cognito credentials in environment.ts
npm start
```
