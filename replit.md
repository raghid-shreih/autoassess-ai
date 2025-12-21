# AutoAssess AI - Claims Automation Module

## Overview
AI-powered car insurance claims damage assessment tool that automates the review and assessment workflow, enabling faster, more accurate claim processing while focusing human expertise where it adds material value.

## Project Architecture

### Frontend (React + Vite)
- **Location**: `client/src/`
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query v5
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: Shadcn/ui components in `client/src/components/ui/`

### Backend (Express)
- **Location**: `server/`
- **API Routes**: `server/routes.ts`
- **Storage**: In-memory storage (`server/storage.ts`)

### Shared Types
- **Location**: `shared/schema.ts`
- **Contains**: Claim, DamageItem, and related type definitions

## Key Features (MVP)

1. **Image Upload**: Drag-and-drop or click-to-upload vehicle damage photos
2. **Simulated AI Damage Detection**: Auto-generates damage assessment with:
   - Detected parts and damage types
   - Severity classification (minor/moderate/severe)
   - Recommended repair actions
   - Per-item confidence scores
3. **Cost Estimation**: Line-item breakdown with parts and labor costs
4. **Confidence Scoring**: Overall assessment confidence with visual indicators
5. **Agent Override**: Edit any damage item's severity, action, and costs
6. **Workflow Actions**: Approve estimates or flag for manual review

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/claims/current` | Get current active claim |
| POST | `/api/claims/assess` | Submit image for AI assessment |
| PATCH | `/api/claims/damage/:damageId` | Update a damage item |
| POST | `/api/claims/approve` | Approve the current claim |
| POST | `/api/claims/flag` | Flag claim for manual review |

## Development

### Running the App
The app runs with `npm run dev` which starts both the Express backend and Vite frontend on port 5000.

### Design System
- Uses Inter font family
- Custom color tokens defined in `client/src/index.css`
- Dark mode support via ThemeProvider
- Follows design guidelines in `design_guidelines.md`

## Data Models

### Claim
- Policy and vehicle information
- Array of damage items
- Overall confidence score
- Total estimate
- Status (pending, in_review, approved, flagged)

### DamageItem
- Part name and damage type
- Severity level (minor, moderate, severe)
- Repair action (repair, replace, paint, buff)
- Confidence percentage
- Labor and parts costs
- AI reasoning explanation
