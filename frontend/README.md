# Tarefitas Frontend

A calm, neurodivergent-first planner built with Tauri, React, TypeScript, and Zustand.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Desktop**: Tauri 2
- **State Management**: Zustand
- **Testing**: Vitest + Testing Library
- **Architecture**: Feature-Sliced Design (FSD)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Run Tauri App

```bash
npm run tauri dev
```

## Distribution (Desktop & Mobile)

App **name**, **description**, and **icon** are configured in:

- **`src-tauri/tauri.conf.json`** — `productName` (display name on desktop and iOS/Android), `app.windows[0].title` (window title), `bundle.shortDescription` / `bundle.longDescription` (store listings), `bundle.icon` (paths under `src-tauri/icons/`).
- **`src-tauri/Cargo.toml`** — package `description` (Rust metadata).
- **`index.html`** — `<title>` and `<meta name="description">` (web view / PWA).
- **`app.json`** — `name` and `description` (Expo / cross-platform).

**Bundle identifier** (e.g. `com.tarefitas.app`) is in `tauri.conf.json` → `identifier`. Use the same value in App Store Connect and Google Play.

**Icons**: Replace the images in `src-tauri/icons/` (e.g. `icon.icns`, `icon.ico`, `32x32.png`, `128x128.png`, and the `Square*` / `StoreLogo` assets for mobile). Tauri uses these for installers and app icons.

After changing `productName` or `identifier`, rebuild the mobile app so the home screen and store show the new name:

```bash
pnpm tauri ios build    # iOS
pnpm tauri android build  # Android (when configured)
```

## Testing

```bash
# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Architecture

The project follows **Feature-Sliced Design** with lowercase filenames and proper suffixes:

- `*.component.tsx` - React components
- `*.hook.ts` - React hooks
- `*.store.ts` - Zustand stores
- `*.utils.ts` - Utility functions
- `*.types.ts` - TypeScript types
- `*.styles.css` - Component styles

See [FSD_STRUCTURE.md](./FSD_STRUCTURE.md) for detailed architecture documentation.

## Key Features

- **Zustand State Management**: Reactive, persistent stores
- **Shared UI Components**: Toast notifications, Alert dialogs
- **Rust Backend**: Tauri commands for ID generation and future operations
- **Testing**: Comprehensive test setup with Vitest
- **Accessibility**: WCAG-compliant, keyboard-navigable

## Project Structure

```
src/
├── app/          # Application layer
├── pages/        # Page components
├── widgets/      # Complex UI blocks
├── features/     # Business features
├── entities/     # Business entities
└── shared/       # Shared utilities and UI
```

## Shared UI Components

### Toast

```typescript
import { toast } from 'shared/ui/toast';

toast.success('Task created successfully');
toast.error('Failed to save task');
toast.info('Processing...');
toast.warning('This action cannot be undone');
```

### Alert

```typescript
import { alert } from 'shared/ui/alert';

alert.confirm('Delete this task?', () => {
  // Handle confirmation
});

alert.show({
  title: 'Warning',
  message: 'Are you sure?',
  onConfirm: () => {},
  showCancel: true,
});
```

## Rust Commands

Tauri commands are available through `shared/lib/rust-commands.ts`:

```typescript
import { generateId } from 'shared/lib/rust-commands';

const id = await generateId();
```

## Design alignment

This frontend implements the product scope defined in the monorepo `docs/`:

- **DESIGN.md** — Reduce cognitive load, calm over efficiency, user-controlled adaptation, predictability, optional features, low sensory load, accessibility as core.
- **MVP_FEATURES.md** — Tasks/subtasks, calm views, calendar, focus timer, focus mode, **pause mode** (burnout safety), orientation panel, preferences, offline-first, calm feedback.
- **NON_GOALS.md** — No productivity scoring, no streaks/guilt, no urgency-driven design, no mandatory flows.

Concrete choices: skip links and route-based document titles (accessibility); sidebar pause toggle and pause banner with neutral copy (MVP #9); visible focus states with `focus-visible`; optional onboarding (AppGuard not used to block core usage).

## Development Guidelines

1. Follow FSD layer rules (see FSD_STRUCTURE.md)
2. Use lowercase filenames with proper suffixes
3. Write tests for stores and utilities
4. Follow neurodivergent-first design principles (see `docs/DESIGN.md`)
5. Ensure accessibility (keyboard navigation, screen readers, skip links, reduced motion)
