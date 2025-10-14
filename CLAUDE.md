# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Omnichat IA** is a multi-channel customer communication platform built with React, TypeScript, Vite, and Supabase. It provides inbox management, contact management, campaigns, AI agents, and prospect tracking across channels like WhatsApp, Instagram, Telegram, and Messenger.

This project was created with [Lovable](https://lovable.dev) and follows its conventions.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development mode
npm run build:dev

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Development Workflow

### Working with Lovable
This project is integrated with [Lovable](https://lovable.dev), which allows AI-assisted development:
- Changes made via Lovable are automatically committed to the repository
- Local changes can be pushed to the repository and will sync with Lovable
- Project URL: https://lovable.dev/projects/22ab8e03-90bb-4be2-af64-4d2f59280fb9

### Local Development Setup
1. Clone the repository
2. Install dependencies: `npm i`
3. Ensure Supabase project is accessible
4. Start dev server: `npm run dev`
5. Access at: http://localhost:8080

### Working with Supabase
- **Dashboard**: https://supabase.com/dashboard/project/bjsuujkbrhjhuyzydxbr
- **Local development**: Use Supabase CLI for local database and functions
- **Configuration**: Local Supabase settings are in `supabase/config.toml`
- **Edge Functions**: Test locally before deploying
- **Database changes**: Always create migrations, never edit types manually

#### Supabase CLI Commands
```bash
# Start Supabase locally
supabase start

# Serve Edge Functions locally (with hot reload)
supabase functions serve

# Deploy a specific function
supabase functions deploy <function-name>

# View function logs
supabase functions logs <function-name>

# Generate TypeScript types from database schema
npx supabase gen types typescript --project-id bjsuujkbrhjhuyzydxbr > src/integrations/supabase/types.ts
```

### Code Organization Principles
- Page components in `src/pages/` handle routing and main functionality
- Reusable UI components in `src/components/ui/` (shadcn/ui)
- Business logic components in `src/components/`
- Helper functions and utilities in `src/lib/`
- Custom hooks in `src/hooks/`
- Supabase integration in `src/integrations/supabase/`
- Edge Functions in `supabase/functions/`

## Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI**: shadcn/ui components + Radix UI primitives
- **Styling**: Tailwind CSS with custom animations
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Forms**: React Hook Form + Zod validation

### Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components (accordion, button, card, etc.)
│   ├── AppSidebar.tsx   # Main navigation sidebar
│   ├── Layout.tsx       # App layout with sidebar
│   └── ProtectedRoute.tsx  # Auth guard component
├── pages/               # Route components
│   ├── Dashboard.tsx    # Overview stats and activity
│   ├── Inbox.tsx        # Message management
│   ├── Contacts.tsx     # Contact database
│   ├── Campaigns.tsx    # Bulk messaging campaigns
│   ├── Prospects.tsx    # Lead prospecting
│   ├── AgentsIA.tsx     # AI agent configuration
│   ├── Settings.tsx     # App settings
│   └── Auth.tsx         # Login/signup page
├── integrations/
│   └── supabase/
│       ├── client.ts    # Supabase client initialization
│       └── types.ts     # Auto-generated database types
├── hooks/               # Custom React hooks
├── lib/
│   └── utils.ts         # Utility functions (cn, etc.)
└── App.tsx              # Root component with routes
```

### Authentication Flow

Authentication uses Supabase Auth with localStorage persistence:

1. **ProtectedRoute** component (`src/components/ProtectedRoute.tsx`) guards all authenticated routes
2. Auth state is managed via `supabase.auth.onAuthStateChange()` listener
3. Unauthenticated users are redirected to `/auth`
4. Auth session includes `autoRefreshToken: true` for automatic token refresh

### Database Schema (Supabase)

Key tables and their relationships:

- **orgs**: Organizations/workspaces
- **members**: User-org relationships with roles (admin/member/viewer)
- **contacts**: Customer contact information with custom fields
- **conversations**: Chat conversations linked to contacts and channels
- **messages**: Individual messages within conversations (inbound/outbound)
- **campaigns**: Bulk messaging campaigns with targeting
- **campaign_messages**: Individual messages sent in campaigns
- **channel_accounts**: Connected social media/messaging accounts
- **ai_agents**: Custom AI agent configurations
- **agent_conversations**: Conversations handled by AI agents
- **prospects**: Lead tracking from prospecting
- **places**: Google Places data for prospecting
- **templates**: Message templates for campaigns
- **consents**: Opt-in/opt-out consent tracking

Enums defined in `types.ts`:
- `agent_type`: vendas | suporte | sdr | atendimento | outros
- `agent_status`: ativo | inativo | treinamento
- `channel_type`: whatsapp | instagram | telegram | messenger
- `campaign_status`: draft | scheduled | active | paused | completed
- `conversation_status`: open | assigned | resolved | closed
- `message_direction`: inbound | outbound
- `prospect_status`: new | validated | imported | opted_out

### AI Agents System

The **AgentsIA** page (`src/pages/AgentsIA.tsx`) provides:

1. **Agent Management**: CRUD operations for AI agents stored in `ai_agents` table
   - Each agent has: name, type, status, system_prompt, model (default: google/gemini-2.5-flash), temperature, max_tokens
   - Agents can be of types: vendas, suporte, sdr, atendimento, outros

2. **AI Tools** (via Supabase Edge Functions):
   - `ai-generate-message`: Generate messages based on context, tone, and objective
   - `ai-summarize`: Create summaries in bullet or paragraph format
   - `ai-optimize-campaign`: Campaign performance recommendations
   - `ai-agent-chat`: Chat interface for AI agent conversations

### WhatsApp & Instagram Integration

The platform supports multi-channel messaging through WhatsApp Business API and Instagram Graph API:

#### **Edge Functions**:
- **WhatsApp**:
  - `whatsapp-webhook`: Receives incoming messages from WhatsApp (GET for verification, POST for messages)
  - `whatsapp-send-message`: Sends messages via WhatsApp Business API
- **Instagram**:
  - `instagram-webhook`: Receives incoming Instagram Direct messages (GET for verification, POST for messages)
  - `instagram-send-message`: Sends messages via Instagram Graph API
- **Common**:
  - `channel-connect`: Connects and validates new channels (supports both WhatsApp & Instagram)

#### **Integration Page** (`src/pages/Integrations.tsx`):
- Connect WhatsApp Business and Instagram Business accounts
- Manage connected channels for both platforms
- View channel status and credentials
- Setup instructions for webhook configuration
- Separate setup components for each channel type

#### **Helper Functions**:
- **WhatsApp** (`src/lib/whatsapp.ts`):
  - `sendWhatsAppMessage()`: Send messages via Edge Function
  - `connectWhatsAppChannel()`: Connect new WhatsApp channel
  - `getWhatsAppChannels()`: Fetch all connected channels
  - `deleteWhatsAppChannel()`: Remove a channel
  - Phone number formatting utilities

- **Instagram** (`src/lib/instagram.ts`):
  - `sendInstagramMessage()`: Send messages via Edge Function
  - `connectInstagramChannel()`: Connect new Instagram channel
  - `getInstagramChannels()`: Fetch all connected channels
  - `disconnectInstagramChannel()`: Disable a channel
  - `deleteInstagramChannel()`: Remove a channel
  - Instagram user ID validation and extraction utilities

#### **Realtime Messages** (`src/hooks/useRealtimeMessages.ts`):
- Subscribe to new messages via Supabase Realtime
- Filter by conversationId or orgId
- Automatic UI updates when messages arrive
- Unread message counter
- Works across all channel types (WhatsApp, Instagram, Telegram, Messenger)

#### **Configuration Requirements**:
To enable integrations, set these environment variables in Supabase Edge Functions:

**WhatsApp**:
- `META_ACCESS_TOKEN`: Permanent access token from Meta for Developers
- `META_VERIFY_TOKEN`: Custom token for webhook verification
- `WHATSAPP_PHONE_NUMBER_ID`: Phone number ID from WhatsApp Business
- `WHATSAPP_BUSINESS_ACCOUNT_ID`: Business account ID (optional)

**Instagram**:
- `META_ACCESS_TOKEN`: Permanent access token from Meta for Developers (same as WhatsApp)
- `META_VERIFY_TOKEN`: Custom token for webhook verification (can be same as WhatsApp)
- `INSTAGRAM_BUSINESS_ACCOUNT_ID`: Instagram Business Account ID
- `PAGE_ID`: Facebook Page ID connected to Instagram Business Account

### Routing Configuration

All protected routes wrap pages with `ProtectedRoute` → `AppLayout`:

- `/` → Dashboard
- `/inbox` → Inbox
- `/contacts` → Contacts
- `/campaigns` → Campaigns
- `/prospects` → Prospects
- `/agents` → AgentsIA
- `/integrations` → Integrations
- `/settings` → Settings
- `/auth` → Auth (public)
- `*` → NotFound

### Path Aliases

TypeScript and Vite are configured with `@` path alias:
```typescript
import { Button } from "@/components/ui/button"
import { supabase } from "@/integrations/supabase/client"
```

Maps to `./src/*`

### Styling Conventions

- Uses Tailwind utility classes
- shadcn/ui provides consistent design system
- Color scheme uses CSS variables defined in `index.css`:
  - `--primary`, `--primary-foreground`
  - `--accent`, `--muted`, `--destructive`, etc.
- Gradient effects common: `bg-gradient-to-r from-primary to-purple-500`
- Sidebar uses shadcn/ui sidebar primitives with collapsible state

### State Management Patterns

1. **Server State**: TanStack Query with 60s staleTime default
2. **Form State**: React Hook Form + Zod schemas
3. **Auth State**: Supabase auth listener + local component state
4. **UI State**: Local component state (useState)

### Custom Hooks

The project includes several custom hooks in `src/hooks/`:

- **`useRealtimeMessages`**: Subscribe to realtime message updates via Supabase Realtime
  - Filter by conversationId or orgId
  - Automatic UI updates when new messages arrive
  - Unread message counter
  - Works across all channel types

- **`usePersistentAuth`**: Handle persistent authentication state
  - Manages auth session persistence
  - Automatic token refresh
  - Auth state synchronization

- **`use-toast`**: Toast notification hook (shadcn/ui)
  - Display success/error/info messages
  - Consistent notification styling

### Supabase Integration

The Supabase client (`src/integrations/supabase/client.ts`) is configured with:
- URL: `https://bjsuujkbrhjhuyzydxbr.supabase.co`
- Auth storage: localStorage with session persistence
- Auto-refresh tokens enabled

**IMPORTANT**: The `types.ts` file is auto-generated. Changes to database schema should be done in Supabase dashboard, then regenerated.

### Common Development Patterns

1. **Creating a new page**:
   - Add component in `src/pages/`
   - Add route in `src/App.tsx` wrapped with `ProtectedRoute` and `AppLayout`
   - Add navigation link in `src/components/AppSidebar.tsx`

2. **Adding a new UI component**:
   - shadcn/ui components are in `src/components/ui/`
   - Use existing components when possible
   - Follow shadcn/ui patterns for new components
   - To add a new shadcn/ui component: check shadcn/ui documentation and copy the component code
   - Components use Tailwind CSS and Radix UI primitives
   - All components support dark mode via CSS variables

3. **Database queries**:
   - Use Supabase client: `await supabase.from('table').select()`
   - Import types from `@/integrations/supabase/types`
   - Handle loading and error states
   - Use `toast` from `sonner` for user feedback

4. **Authentication checks**:
   - Get current user: `const { data: { user } } = await supabase.auth.getUser()`
   - Check if authenticated: user will be null if not logged in
   - Sign out: `await supabase.auth.signOut()`

5. **Working with Edge Functions**:
   - Edge Functions are located in `supabase/functions/`
   - Each function has its own directory with an `index.ts` entry point
   - Functions follow Deno runtime conventions (not Node.js)
   - Test locally using Supabase CLI: `supabase functions serve`
   - Deploy functions: `supabase functions deploy <function-name>`
   - Access environment variables: `Deno.env.get('VARIABLE_NAME')`
   - Available functions:
     - AI Tools: `ai-generate-message`, `ai-summarize`, `ai-optimize-campaign`, `ai-agent-chat`
     - WhatsApp: `whatsapp-webhook`, `whatsapp-send-message`, `whatsapp-qr-connect`
     - Instagram: `instagram-webhook`, `instagram-send-message`
     - Common: `channel-connect`

6. **Adding a new channel integration**:
   - Create webhook handler in `supabase/functions/`
   - Create send message handler in `supabase/functions/`
   - Add helper functions in `src/lib/` (e.g., `whatsapp.ts`, `instagram.ts`)
   - Add setup component in `src/components/` (e.g., `WhatsAppSetup.tsx`)
   - Update `channel-connect` function to support new channel type
   - Add channel type to `channel_type` enum in database
   - Update Integrations page to include new channel

## TypeScript Configuration

TypeScript is configured with relaxed strictness for rapid development:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

## Common Issues and Troubleshooting

### Port Already in Use
If port 8080 is already in use:
- Check for other processes using the port: `lsof -ti:8080`
- Kill the process: `kill -9 $(lsof -ti:8080)`
- Or change the port in `vite.config.ts`

### Supabase Connection Issues
- Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly
- Check network connectivity to Supabase
- Verify the Supabase project is running (not paused)

### Type Errors After Schema Changes
- Regenerate types: `npx supabase gen types typescript --project-id bjsuujkbrhjhuyzydxbr > src/integrations/supabase/types.ts`
- Clear TypeScript cache: `rm -rf node_modules/.vite`
- Restart dev server

### Edge Function Errors
- Check function logs in Supabase dashboard
- Verify environment variables are set in Supabase Edge Functions settings
- Test locally with Supabase CLI before deploying

### Authentication Issues
- Clear browser localStorage and cookies
- Check if Supabase Auth is properly configured
- Verify email confirmation settings if using email authentication

### WhatsApp/Instagram Integration Issues
- Verify Meta access tokens are valid and not expired
- Check webhook URL is publicly accessible (use ngrok for local testing)
- Ensure verify token matches between Meta app and Edge Function
- Check Meta app permissions include required scopes

## Database Migrations

Database migrations are stored in `supabase/migrations/` directory. When making schema changes:

1. Create migrations in the Supabase dashboard or using Supabase CLI
2. Migration files follow naming convention: `YYYYMMDDHHMMSS_description.sql`
3. After schema changes, regenerate types by running:
   ```bash
   npx supabase gen types typescript --project-id bjsuujkbrhjhuyzydxbr > src/integrations/supabase/types.ts
   ```
4. Never edit `types.ts` manually - it's auto-generated

Current migration:
- `20241014_create_organizations.sql`: Core organization structure and multi-tenant setup

## Important Notes

- Development server runs on port 8080 (not default 5173)
- Project uses SWC for fast refresh instead of Babel
- Lovable integration via `lovable-tagger` plugin in development mode
- All database types are auto-generated - don't edit `types.ts` manually
- This project is managed through Lovable (https://lovable.dev) - changes can be made locally or via Lovable interface
- Git repository: https://github.com/agenciapixel/connect-ia.git
