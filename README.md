# Life Command Centre v2

A personal life management dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- **Home Dashboard** - Overview of all life areas with quick actions
- **Money Manager** - Track accounts, expenses, budgets, debts, and recurring payments
- **Zen Garden** - Gamified habit tracker with virtual plants that grow with consistency
- **Fitness Tracker** - Log workouts, track streaks, and monitor progress
- **Nutrition Logger** - Track meals, water intake, and nutritional goals
- **Settings** - Profile, notifications, data management, and AI configuration

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and builds
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons
- **Google Gemini AI** for intelligent suggestions

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  components/       # Shared components (Layout, SetupWizard, UI library)
  constants/        # App constants and default data
  features/         # Feature modules (home, money, garden, fitness, nutrition, settings)
  hooks/            # Custom React hooks
  services/         # Service layer (storage, notifications, streaks, garden, AI)
  store/            # Zustand store
  styles/           # Global styles
  types/            # TypeScript type definitions
  utils/            # Utility functions
```

## License

MIT
