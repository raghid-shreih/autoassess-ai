# AutoAssess AI

AI-assisted automobile claims assessment and workflow prototype designed to explore how AI can accelerate vehicle-damage review while keeping human judgment in the loop.

## Overview

AutoAssess AI demonstrates an end-to-end claims workflow in which uploaded vehicle-damage images are assessed, repair recommendations and estimated costs are presented, confidence scores help communicate uncertainty, and a claims professional can approve, edit, or escalate the assessment for manual review.

The current prototype uses **simulated AI damage-assessment outputs** to demonstrate the product workflow and human-in-the-loop interaction. The assessment layer is intentionally separable so it can be replaced with a production computer-vision or multimodal AI service in a future implementation.

## Why I Built It

Insurance claims processing is a useful example of a workflow where automation can reduce repetitive work, but fully automated decision-making is not always appropriate. I built this prototype to explore a design in which AI provides structured recommendations while a human reviewer remains responsible for uncertain or high-impact decisions.

## Key Features

- Vehicle-damage image upload
- Simulated AI damage detection and classification
- Damage severity and repair-action recommendations
- Per-item and overall confidence scoring
- Parts and labor cost estimates
- Human override of AI-generated recommendations
- Claim approval and manual-review escalation
- Structured claim and damage-item data models

## Architecture

```text
┌──────────────────────────┐
│      React Frontend      │
│   TypeScript + Vite      │
└────────────┬─────────────┘
             │
          REST API
             │
┌────────────▼─────────────┐
│      Express Backend     │
└────────────┬─────────────┘
             │
       Claims Workflow
             │
   ┌─────────┼──────────┐
   │         │          │
   ▼         ▼          ▼
Assessment  Cost     Review /
 Logic    Estimation Escalation
   │         │          │
   └─────────┼──────────┘
             │
       Shared Data Model
```

### Frontend

- React 18
- TypeScript
- Vite
- TanStack Query
- Wouter
- Tailwind CSS
- shadcn/ui

### Backend

- Node.js
- Express
- REST API
- In-memory prototype storage with pre-seeded mock claims

### Shared Models

The frontend and backend share typed claim and damage-item schemas to keep the workflow model consistent across the application.

## Human-in-the-Loop Design

```text
AI-assisted assessment
        │
        ▼
 Confidence score
        │
        ├── Sufficient confidence → Human review / approval
        │
        └── Low confidence → Manual review / escalation
```

The goal is not to remove the claims professional from the workflow. It is to focus human attention where judgment adds the most value while automating repetitive analysis and data presentation.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/claims/current` | Retrieve the active claim |
| `POST` | `/api/claims/assess` | Submit an image for assessment |
| `PATCH` | `/api/claims/damage/:damageId` | Update a damage item |
| `POST` | `/api/claims/approve` | Approve the current claim |
| `POST` | `/api/claims/flag` | Escalate a claim for manual review |

## Project Structure

```text
client/              React frontend
server/              Express API and workflow logic
shared/              Shared schemas and types
script/              Build utilities
attached_assets/     Prototype assets
```

## Running Locally

### Prerequisites

- Node.js
- npm

### Install and start

```bash
npm install
npm run dev
```

The development server starts the Express backend and Vite frontend together.

## Current Prototype Limitations

- Damage detection is simulated rather than connected to a production AI vision model.
- Storage is currently in-memory and intended for demonstration purposes.
- Cost estimates use prototype data rather than insurer or repair-network pricing feeds.
- Production authentication, authorization, audit logging, monitoring, and security controls are outside the current prototype scope.

## Future Improvements

- Integrate a multimodal vision model for vehicle-damage assessment
- Add persistent PostgreSQL storage
- Add role-based authentication and authorization
- Introduce model and retrieval evaluation metrics
- Add structured audit trails for AI and human decisions
- Connect repair-cost data sources
- Add automated tests and CI workflows
- Evaluate confidence thresholds against real claims data

## Engineering Perspective

The project is primarily an exploration of **AI-assisted workflow design**, not a claim that AI should make autonomous insurance decisions. The central design principle is to combine automation with explicit uncertainty, traceable recommendations, and human control.

## Disclaimer

This project is a prototype built for demonstration and learning purposes. It is not intended for production insurance claims processing or real-world financial decision-making.
