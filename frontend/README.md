# GRICPO FTIMS

A production-ready Next.js foundation using TypeScript, the App Router, Tailwind CSS, shadcn/ui, and the TweakCN Ocean Breeze theme.

## Start locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Commands

```bash
pnpm dev
pnpm lint
pnpm build
pnpm start
```

## Architecture

The project uses feature-first organization while keeping framework entry points and shared primitives easy to find.

```text
src/
├── app/                    # Routes, layouts, loading states, and route handlers
│   ├── (auth)/             # Authentication route group
│   ├── (dashboard)/        # Authenticated application route group
│   └── api/                # HTTP route handlers
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   ├── shared/             # Reusable application components
│   ├── layout/             # Headers, sidebars, navigation, and shells
│   └── forms/              # Reusable form building blocks
├── features/               # Feature modules with local components and server code
├── hooks/                  # Cross-feature React hooks
├── providers/              # React context providers
├── stores/                 # Client-side state stores
├── server/
│   ├── actions/            # Shared Server Actions
│   ├── auth/               # Server-only authentication helpers
│   ├── db/                 # Database client, schema, and migration integration
│   ├── repositories/       # Data-access boundaries
│   └── services/           # Business use cases and orchestration
├── lib/
│   ├── api/                # Shared API clients and transport helpers
│   └── env/                # Typed environment-variable access
├── config/                 # Application configuration
├── constants/              # Shared immutable values
├── types/                  # Cross-feature TypeScript types
├── validations/            # Shared validation schemas
├── styles/                 # Additional global style modules
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

Keep code close to the feature that owns it. Promote a component, hook, type, or validation schema to a shared directory only after more than one feature needs it. Server-only modules should live under `src/server` or a feature’s `server` directory and should never be imported into client components.

The current supervisor UI is organized by feature:

```text
src/features/
├── dashboard/              # Overview screen and sample dashboard data
├── equipment/              # Inventory, equipment forms/details, QR UI, and sample data
├── allocations/            # Allocation list, issue form/details, and sample data
├── movements/              # Equipment return and transfer forms and records
├── projects/               # Project list, form, map, and sample data
├── reports/                # Review queue, report details, and sample submissions
├── maintenance/            # Stats, request, fault, and service report screens
├── technicians/            # Technician list, profile details, and profile form
├── calibration/            # Calibration stats, calendar, records, and scheduling form
└── settings/               # Reference data tabs for configurable dropdown values
```

Each feature keeps its own `components/` and `data/` folders. Dashboard chrome lives in `src/components/layout/`, widgets used by several features live in `src/components/shared/`, and browser-only draft, reference-data, and report-review state lives in `src/stores/`. The `src/app/` files only connect routes to these screens. Sample data, attachments, and browser state are UI placeholders until backend integration is added. Active reference values currently feed the equipment category, technician discipline, allocation site/accessory, and return/transfer site/accessory dropdowns. Test methods and status codes are prepared for backend-connected workflows. Maintenance forms currently use fields inferred from the Stats reference image; they can be adjusted when form references are available. Technician photos are represented by initials until profile images are available.

## Adding a feature

```text
src/features/example/
├── components/
├── hooks/
├── server/
├── types.ts
└── validations.ts
```

The directories are intentionally empty placeholders until the application requires them. This keeps the foundation clear without adding unused logic or dependencies.
