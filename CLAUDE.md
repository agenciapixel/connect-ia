# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Omnichat IA** (Connect IA) is a multi-channel customer communication platform built with React, TypeScript, Vite, and Supabase. It provides inbox management, contact management, campaigns, AI agents, CRM pipeline, attendant management, and prospect tracking across channels like WhatsApp, Instagram, Telegram, and Messenger.

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
- **Lovable Development**: Changes made via Lovable are automatically committed to the repository
- **Local Development**: Local changes can be pushed to the repository and will sync with Lovable
- **Hybrid Workflow**: You can work both locally and via Lovable - they stay in sync through Git
- **Component Tagging**: The `lovable-tagger` plugin runs in development mode to track components
- Project URL: https://lovable.dev/projects/22ab8e03-90bb-4be2-af64-4d2f59280fb9

**Best Practices**:
- Pull latest changes before starting work: `git pull origin main`
- Complex backend/Edge Function work is easier locally with proper IDE support
- UI/UX iterations can be faster in Lovable with visual feedback
- Always test locally before deploying to production

### Local Development Setup
1. Clone the repository
2. Install dependencies: `npm i`
3. Set up environment variables (see [Environment Variables](#environment-variables) section)
4. (Optional) Start Supabase locally: `supabase start`
   - This starts local PostgreSQL, Edge Functions runtime, and Studio
   - Access local Studio at: http://127.0.0.1:54323
   - Local API endpoint: http://127.0.0.1:54321
5. Start dev server: `npm run dev`
6. Access at: http://localhost:8080

**Note**: You can develop against the remote Supabase instance (production) or local Supabase. For local development, update your `.env` to point to `http://127.0.0.1:54321`.

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
│   ├── Prospects.tsx    # Lead prospecting with Google Places
│   ├── CRM.tsx          # CRM pipeline management (Kanban view)
│   ├── Attendants.tsx   # Human attendant management
│   ├── AgentsIA.tsx     # AI agent configuration
│   ├── Integrations.tsx # Channel integration setup
│   ├── Settings.tsx     # App settings
│   ├── Auth.tsx         # Login/signup page
│   └── PrivacyPolicy.tsx # Privacy policy (public)
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

### Multi-Tenancy System

The application implements a multi-organization (multi-tenancy) architecture:

1. **Organization Context** (`src/contexts/OrganizationContext.tsx`):
   - Manages current organization state across the application
   - Provides `useOrganization()` hook for accessing org data
   - Stores selected org in localStorage for persistence
   - Automatically fetches user's organizations on mount

2. **Organization Switcher** (`src/components/OrganizationSwitcher.tsx`):
   - Dropdown component in sidebar header
   - Shows all organizations user belongs to with their role
   - Allows switching between organizations (reloads page)
   - Link to create new organization

3. **Data Isolation**:
   - All database queries MUST filter by `org_id` using `currentOrg.id`
   - React Query keys MUST include `currentOrg?.id` for proper cache invalidation
   - Queries MUST use `enabled: !!currentOrg` to prevent running without org context
   - Example pattern:
   ```typescript
   const { currentOrg } = useOrganization();

   const { data } = useQuery({
     queryKey: ["resource", currentOrg?.id],
     queryFn: async () => {
       if (!currentOrg) return [];
       return await supabase
         .from("table")
         .select("*")
         .eq("org_id", currentOrg.id);
     },
     enabled: !!currentOrg,
   });
   ```

4. **Organization Membership**:
   - Users belong to organizations via `members` table
   - Roles: `admin`, `member`, `viewer`
   - Role-based permissions control access to features

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
- **attendants**: Human attendant profiles and status
  - Stores: user_id, org_id, full_name, email, phone, avatar_url
  - Status: online, busy, away, offline, break, training
  - Settings: max_concurrent_chats, auto_accept, working_hours
  - Profile: department, position, employee_id
  - Skills: skills[], languages[], specializations[]
  - Metrics: total_chats, avg_response_time, satisfaction_score, last_activity_at
- **attendant_sessions**: Active work sessions for attendants
  - Tracks: started_at, ended_at, duration_minutes, status (active/ended/paused)
  - Metrics: chats_handled, messages_sent, avg_response_time
- **attendant_metrics**: Performance metrics aggregation
  - Period types: daily, weekly, monthly
  - Metrics: total_chats, resolved_chats, transferred_chats, abandoned_chats
  - Times: avg_response_time, avg_resolution_time, total_work_time
  - Quality: satisfaction_avg, satisfaction_count, first_contact_resolution
- **conversation_assignments**: Conversation-to-attendant assignments
  - Assignment tracking: assigned_at, unassigned_at, assigned_by
  - Performance: response_time, resolution_time, satisfaction_rating
  - Status: assigned, active, transferred, resolved, abandoned
  - Management: notes, transfer_reason
- **attendant_availability**: Schedule and availability management
  - Future scheduling support for attendant shifts
- **prospects**: Lead tracking from prospecting
- **places**: Google Places data for prospecting
- **pipeline_stages**: CRM pipeline stages per organization
- **pipeline_cards**: Prospect cards in pipeline with position tracking
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

3. **AI Agent Testing** (`src/components/AIAgentTester.tsx`):
   - Interactive testing interface for AI agents
   - Load and select active agents dynamically
   - Pre-built example messages by agent type (atendimento, vendas, suporte)
   - Real-time response generation
   - Context-aware testing (supports conversation history)
   - Response metadata display (context usage, message count)

### Attendants System

The **Attendants** page (`src/pages/Attendants.tsx`) provides human attendant management:

1. **Attendant Management**: Manage human agents who handle conversations
   - Track attendant availability and status
   - Session management and activity tracking
   - Performance metrics per attendant

2. **Conversation Assignment**: Automatic and manual conversation assignment
   - Auto-assign conversations to available attendants
   - Load balancing based on attendant capacity
   - Priority routing for VIP contacts

3. **Attendant Tools** (via Supabase Edge Functions):
   - `auto-assign-conversation`: Automatically assign conversations to available attendants
   - `manage-attendant-session`: Handle attendant login/logout and status changes
   - `update-attendant-metrics`: Update real-time performance metrics

4. **Key Components**:
   - **`AttendantDashboard`** (`src/components/AttendantDashboard.tsx`): Real-time dashboard for attendant monitoring and performance
     - Online attendant monitoring with status badges
     - Unassigned conversation queue with auto-refresh (15s interval)
     - Active assignment tracking (10s interval)
     - Active session management
     - Manual conversation assignment with notes
     - Session start/end controls
     - Multi-tab interface (Overview, Attendants, Conversations, Sessions)

   - **`AttendantsUnified`** (`src/pages/AttendantsUnified.tsx`): Unified attendant management page
     - Complete CRUD operations for attendants
     - Advanced filtering (search, status, department)
     - Real-time statistics dashboard
     - Auto-assignment toggle
     - Session management interface
     - Performance metrics view
     - Bulk operations support

   - **`useAttendants`** (`src/hooks/useAttendants.ts`): Comprehensive hook for attendant management
     - Multiple query functions with automatic refetch intervals
     - Attendants query (all org attendants)
     - Online attendants query (30s refetch)
     - Unassigned conversations query (15s refetch)
     - Active assignments query (10s refetch)
     - Active sessions query (30s refetch)
     - CRUD mutations (create, update, delete attendants)
     - Status update mutation
     - Manual and automatic conversation assignment
     - Session start/end mutations
     - Smart attendant selection algorithm (findBestAttendant)

   - **`useAttendantMetrics`**: Hook for attendant performance analytics
     - Daily/weekly/monthly metrics aggregation
     - Consolidated metrics across all attendants
     - Response time, resolution time tracking
     - Satisfaction scores
     - First Contact Resolution (FCR) metrics
     - Work time tracking

   - **`useAttendantAvailability`**: Hook for attendant schedule management
     - Date-based availability tracking
     - Future scheduling support

### CRM Pipeline System

The **Prospects** page (`src/pages/Prospects.tsx`) includes a Kanban-style CRM pipeline for managing prospect lifecycles:

#### **Features**:
1. **Pipeline Stages**: Drag-and-drop cards between customizable stages (Lead, Qualified, Proposal, Negotiation, Won, Lost)
2. **Pipeline Cards**: Each prospect becomes a card with key information (name, value, contact, source)
3. **Stage Management**: Create, edit, delete, and reorder pipeline stages
4. **Visual CRM**: Kanban board view powered by React Beautiful DnD or similar
5. **Data Structure**:
   - `pipeline_stages` table: Custom pipeline stages per organization
   - `pipeline_cards` table: Prospect cards linked to stages with position tracking

#### **Components**:
- **`CRMPipeline`** (`src/components/CRMPipeline.tsx`):
  - Kanban board interface for prospect management
  - Drag-and-drop between stages
  - Card editing and status updates

- **`BulkExportProspects`** (`src/components/BulkExportProspects.tsx`):
  - Export prospects in bulk to CSV/Excel
  - Filter by pipeline stage, status, or date range
  - Batch operations for prospect management

- **`OpportunityModal`** (`src/components/OpportunityModal.tsx`):
  - Modal for creating/editing opportunities in CRM pipeline
  - Form validation with Zod schema
  - Pipeline stage selection (lead → contacted → qualified → proposal → negotiation → won)
  - Expected revenue tracking
  - Probability slider (0-100%)
  - Notes and tags support
  - Auto-population from prospect/place data
  - Org-scoped data with currentOrg context

### Google Places Prospecting System

The **Prospects** page (`src/pages/Prospects.tsx`) also provides a complete system for finding and managing prospects via Google Maps/Places:

#### **Features**:
1. **Google Maps Search**:
   - Search by keyword, location, and business type
   - GPS-based nearby search with configurable radius
   - Category filtering (restaurants, stores, services, etc.)
   - Hybrid approach: Google Places API (official) with scraping fallback

2. **Results Management**:
   - Visual display of search results with key business information
   - Automatic saving to `places` and `prospects` tables
   - Import prospects directly to contacts database
   - Status tracking: new, validated, imported, opted_out

3. **Data Structure**:
   - `places` table: Stores Google Places data (name, address, phone, website, coordinates)
   - `prospects` table: Links places to organizations with prospecting status

#### **Edge Function**:
- **`google-places-search`**: Hybrid search function
  - Primary: Google Places API (official, requires `GOOGLE_PLACES_API_KEY`)
  - Fallback: Web scraping if API unavailable or fails
  - Automatically saves results to database
  - Returns enriched place data with location coordinates

#### **Components**:
- **`GooglePlacesSearch`** (`src/components/GooglePlacesSearch.tsx`):
  - Search form with filters (query, location, category, type, radius)
  - GPS location detection
  - Real-time search with loading states

- **`GooglePlacesResults`** (`src/components/GooglePlacesResults.tsx`):
  - Grid display of found places
  - Business information cards (rating, address, phone, website)
  - Click-to-action buttons

#### **Helper Functions** (`src/lib/googlePlaces.ts`):
- `searchGooglePlaces()`: Main search function
- `searchNearbyPlaces()`: Search by coordinates
- `searchPlacesByText()`: Search by text and location
- `PLACE_TYPES`: Comprehensive list of business categories
- `PLACE_CATEGORIES`: Grouped categories for UI filters

#### **Configuration**:
Set in Supabase Edge Functions environment:
- `GOOGLE_PLACES_API_KEY`: Google Places API key (optional, falls back to scraping)

#### **Usage Flow**:
1. User enters search criteria (query, location, category)
2. Edge Function searches Google Places API or scrapes if needed
3. Results automatically saved to `places` and `prospects` tables
4. User reviews results in Results tab
5. User imports selected prospects to contacts database
6. Prospects move to "Prospects" tab with import status

### WhatsApp & Instagram Integration

The platform supports multi-channel messaging through WhatsApp Business API and Instagram Graph API:

#### **Edge Functions**:
- **WhatsApp**:
  - `whatsapp-webhook`: Receives incoming messages from WhatsApp (GET for verification, POST for messages)
  - `whatsapp-send-message`: Sends messages via WhatsApp Business API
  - `whatsapp-qr-connect`: QR code-based WhatsApp connection (alternative to Business API)
- **Instagram**:
  - `instagram-webhook`: Receives incoming Instagram Direct messages (GET for verification, POST for messages)
  - `instagram-send-message`: Sends messages via Instagram Graph API
- **Common**:
  - `channel-connect`: Connects and validates new channels (supports both WhatsApp & Instagram)
  - `meta-oauth-exchange`: Exchanges Meta OAuth codes for access tokens (Instagram/Facebook integration)

#### **Integration Page** (`src/pages/Integrations.tsx`):
- Connect WhatsApp Business and Instagram Business accounts
- Manage connected channels for both platforms
- View channel status and credentials
- Setup instructions for webhook configuration
- Separate setup components for each channel type

#### **Connection Methods**:
1. **WhatsApp**:
   - **Business API Method** (`WhatsAppBusinessConnect.tsx`): Official Meta/Facebook WhatsApp Business API integration
     - Automatic webhook testing
     - Configuration validation
     - Direct connection to Meta's infrastructure
     - Requires Meta for Developers account and app setup
   - **QR Code Method** (`WhatsAppQRConnect.tsx`): Alternative scan QR code method (uses `whatsapp-qr-connect` with Evolution API)

2. **Instagram/Facebook**:
   - **Meta OAuth** (`MetaOAuthConnect.tsx`): OAuth flow for Instagram/Facebook Business (uses `meta-oauth-exchange`)
   - Requires Facebook Page connected to Instagram Business Account

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

- **Message Debouncer** (`src/lib/messageDebouncer.ts`):
  - Prevents duplicate message processing from webhooks
  - Handles race conditions when multiple webhook events arrive
  - Uses time-based deduplication strategy

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

**Meta OAuth** (for `meta-oauth-exchange` function):
- `META_APP_ID`: Meta/Facebook App ID
- `META_APP_SECRET`: Meta/Facebook App Secret
- `META_REDIRECT_URI`: OAuth redirect URI (must match Meta App settings)

### Campaigns System

The **Campaigns** page (`src/pages/Campaigns.tsx`) provides comprehensive campaign management:

#### **Campaign Flow Editor** (`src/components/CampaignFlowEditor.tsx`):
Advanced visual flow builder for multi-step campaigns:

1. **Step Types**:
   - `message`: Send text/media messages
   - `delay`: Wait for specified time (minutes/hours/days)
   - `condition`: Branch based on conditions
   - `action`: Trigger specific actions
   - `wait_for_response`: Wait for customer response with timeout
   - `tag`: Add/remove contact tags
   - `webhook`: Call external APIs (GET/POST/PUT)
   - `split`: A/B testing (random, percentage, custom)
   - `merge`: Merge flow branches
   - `survey`: Send survey questions
   - `notification`: Send notifications to team
   - `calendar`: Schedule calendar events
   - `location`: Request or share location

2. **Flow Management**:
   - Add, edit, remove, reorder steps
   - Drag-and-drop interface for step organization
   - Step preview and validation
   - Save/load flow configurations
   - Visual flow representation with icons

3. **AI Assistant Integration**:
   - AI-powered flow suggestions
   - Message optimization
   - Best practice recommendations

4. **Configuration Options**:
   - Per-step configuration dialogs
   - Delay unit selection (minutes/hours/days)
   - Webhook method and URL configuration
   - Split percentage and type selection
   - Timeout settings for response waits

5. **Use Cases**:
   - Drip campaigns
   - Welcome sequences
   - Nurture flows
   - Re-engagement campaigns
   - Survey distribution
   - Event-based messaging

### Inbox & Messaging System

The **Inbox** page (`src/pages/Inbox.tsx`) is the central hub for all conversations:

#### **Features**:
1. **Real-time Conversation List**:
   - Multi-channel conversation view (WhatsApp, Instagram, Telegram, Messenger)
   - Status filtering (open, assigned, resolved, closed)
   - Priority and tag filtering
   - Search by contact name, email, or phone
   - Unread message indicators
   - Last message preview with timestamp

2. **Conversation Detail View**:
   - Full message history with direction indicators (inbound/outbound)
   - Rich message display (text, media, reactions)
   - Contact information sidebar
   - Conversation metadata (tags, priority, assigned agent)
   - Quick actions (assign, tag, archive, close)

3. **Message Composer**:
   - Rich text editor
   - Media attachments support
   - Template selection
   - AI-powered message suggestions
   - Send shortcuts (Enter to send, Shift+Enter for new line)

4. **Agent Assignment**:
   - Manual assignment to human attendants
   - AI agent assignment
   - Auto-assignment toggle
   - Load balancing based on agent capacity

5. **Real-time Updates**:
   - New message notifications
   - Conversation status changes
   - Agent typing indicators
   - Presence status updates

#### **Integration with useRealtimeMessages**:
```typescript
const { messages, unreadCount } = useRealtimeMessages({
  conversationId: selectedConversation?.id,
  orgId: currentOrg?.id
});
```

### Dashboard & Analytics

The **Dashboard** page (`src/pages/Dashboard.tsx`) provides comprehensive analytics:

#### **Key Metrics**:
1. **Overview Cards**:
   - Total messages (with trend indicators)
   - Active contacts
   - Active campaigns
   - Response rate percentage
   - Trend calculations (up/down arrows with percentages)

2. **Charts and Visualizations** (using Recharts):
   - **Line Chart**: Messages over time (last 7 days)
   - **Area Chart**: Conversation volume trends
   - **Bar Chart**: Channel distribution (WhatsApp, Instagram, etc.)
   - **Pie Chart**: Conversation status breakdown

3. **Recent Activity Feed**:
   - Latest conversations with timestamps
   - Contact information
   - Status badges
   - Quick navigation to conversation

4. **Data Refresh**:
   - Automatic data fetching with TanStack Query
   - Real-time updates via Supabase subscriptions
   - Skeleton loading states for smooth UX

#### **Performance Optimization**:
- Parallel data fetching with `Promise.all()`
- Efficient count queries with `{ count: "exact", head: true }`
- Date range filtering with `date-fns` utilities
- Responsive chart rendering with `ResponsiveContainer`

### Routing Configuration

All protected routes wrap pages with `ProtectedRoute` → `AppLayout`:

- `/` → Dashboard
- `/inbox` → Inbox
- `/contacts` → Contacts
- `/campaigns` → Campaigns
- `/prospects` → Prospects (Lead prospecting with Google Places)
- `/crm` → CRM (Kanban pipeline view)
- `/attendants` → Attendants (Human attendant management)
- `/agents` → AgentsIA
- `/integrations` → Integrations
- `/settings` → Settings
- `/auth` → Auth (public)
- `/privacy-policy` → PrivacyPolicy (public)
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

- **`useAttendants`**: Manage attendant state and operations
  - Fetch attendant data with org filtering
  - Handle attendant status updates
  - Session management

- **`use-toast`**: Toast notification hook (shadcn/ui)
  - Display success/error/info messages
  - Consistent notification styling

- **`use-mobile`**: Detect mobile viewport for responsive UI
  - Returns boolean indicating mobile screen size
  - Uses window resize listener

**Important Hook Patterns**:
When creating or modifying hooks that interact with org-specific data:
```typescript
// Always include currentOrg?.id in query keys
const { currentOrg } = useOrganization();

const { data } = useQuery({
  queryKey: ['resource-name', currentOrg?.id],
  queryFn: async () => {
    if (!currentOrg?.id) return [];
    // Query logic here
  },
  enabled: !!currentOrg?.id,
  refetchInterval: 30000 // Optional: for real-time data
});
```

**Real-time Data Patterns**:
The platform uses aggressive refetch intervals for real-time features:
- Critical data (unassigned conversations): 10-15s
- Moderate priority (online attendants, active sessions): 30s
- Low priority (metrics, historical data): 60s or on-demand

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
     - Prospecting: `google-places-search`
     - Attendants: `auto-assign-conversation`, `manage-attendant-session`, `update-attendant-metrics`
     - Common: `channel-connect`, `get-channels`, `disconnect-channel`, `meta-oauth-exchange`

6. **Adding a new channel integration**:
   - Create webhook handler in `supabase/functions/`
   - Create send message handler in `supabase/functions/`
   - Add helper functions in `src/lib/` (e.g., `whatsapp.ts`, `instagram.ts`)
   - Add setup component in `src/components/` (e.g., `WhatsAppSetup.tsx`)
   - Update `channel-connect` function to support new channel type
   - Add channel type to `channel_type` enum in database
   - Update Integrations page to include new channel

## Environment Variables

### Frontend Environment Variables
Create a `.env` file in the root directory with:
```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://bjsuujkbrhjhuyzydxbr.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Meta/Facebook OAuth (Frontend)
VITE_META_APP_ID=your-meta-app-id-here
```

**Note**: `VITE_META_APP_ID` is required for Meta OAuth integration on the frontend (Instagram/Facebook Business connection).

### Supabase Edge Functions Environment Variables
Set these in Supabase Dashboard → Edge Functions → Environment Variables or locally using Supabase CLI:

```bash
# Meta/Facebook Integration
META_ACCESS_TOKEN=your-permanent-access-token
META_VERIFY_TOKEN=your-custom-verify-token
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret
META_REDIRECT_URI=your-oauth-redirect-uri

# WhatsApp Business API
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id

# Instagram Business
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-instagram-business-account-id
PAGE_ID=your-facebook-page-id

# Google Places API
GOOGLE_PLACES_API_KEY=your-google-places-api-key
```

**Note**: See [env.example](env.example) for a template of required environment variables.

## TypeScript Configuration

TypeScript is configured with relaxed strictness for rapid development:
- `noImplicitAny: false`
- `strictNullChecks: false`
- `noUnusedLocals: false`
- `noUnusedParameters: false`

## Debugging and Development Tools

### Browser DevTools Integration
- **React Query Devtools**: Enabled in development mode
  - View all queries, their status, and cached data
  - Manually trigger refetches
  - Inspect query dependencies
  - Access via floating icon in bottom-left corner

- **Supabase Realtime Inspector**:
  - Monitor realtime subscriptions in browser console
  - Check connection status: `supabase.realtime.connection.state`
  - View active channels and subscriptions

- **Console Debugging Patterns**:
  ```typescript
  // Org context debugging
  console.log('Current Org:', currentOrg);

  // Query debugging
  console.log('Query Data:', data);
  console.log('Query Error:', error);
  console.log('Is Loading:', isLoading);

  // Mutation debugging
  console.log('Mutation Status:', mutation.status);
  console.log('Mutation Variables:', mutation.variables);
  ```

### Edge Function Debugging

#### **Local Debugging**:
```bash
# Serve with inspector for Chrome DevTools
supabase functions serve --inspect

# View real-time logs
supabase functions logs <function-name> --follow

# Test with curl
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/<function-name>' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

#### **Production Debugging**:
```bash
# View recent logs
supabase functions logs <function-name> --limit 100

# Filter by time
supabase functions logs <function-name> --since 1h

# Search logs
supabase functions logs <function-name> | grep "ERROR"
```

#### **Common Edge Function Issues**:
1. **CORS Errors**:
   - Ensure function returns proper CORS headers
   - Check `Access-Control-Allow-Origin` is set correctly

2. **Timeout Issues**:
   - Functions have 60s timeout limit
   - Break long operations into smaller chunks
   - Consider using background jobs for long tasks

3. **Environment Variables Not Found**:
   - Verify vars are set in Supabase Dashboard
   - Check spelling and case sensitivity
   - Use `Deno.env.get('VAR_NAME')` not `process.env`

### Database Debugging

#### **Query Performance**:
```sql
-- Enable query timing in Supabase Studio SQL Editor
EXPLAIN ANALYZE
SELECT * FROM conversations WHERE org_id = 'xxx';
```

#### **RLS Policy Debugging**:
```sql
-- Check active policies
SELECT * FROM pg_policies WHERE tablename = 'conversations';

-- Test as specific user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub = 'user-id-here';
SELECT * FROM conversations;
```

#### **Common Database Issues**:
1. **Empty Results Despite Data Existing**:
   - Check RLS policies are correctly configured
   - Verify `org_id` filter matches current organization
   - Ensure user has proper role in `members` table

2. **Slow Queries**:
   - Add indexes on frequently filtered columns (`org_id`, `created_at`)
   - Use `select('specific,columns')` instead of `select('*')`
   - Limit results with `.limit()` and pagination

3. **Foreign Key Violations**:
   - Verify referenced records exist before insert
   - Check cascade delete settings
   - Use transactions for related inserts

### Real-time Subscription Debugging

#### **Check Subscription Status**:
```typescript
const channel = supabase
  .channel('custom-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'messages'
  }, (payload) => {
    console.log('Change received!', payload);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });

// Check channel status
console.log('Channel state:', channel.state);
```

#### **Common Realtime Issues**:
1. **Subscriptions Not Firing**:
   - Check RLS policies allow user to see changes
   - Verify table has `REPLICA IDENTITY FULL` for updates
   - Confirm Realtime is enabled for the table in Supabase

2. **Too Many Connections**:
   - Unsubscribe when components unmount
   - Reuse channels instead of creating many
   - Use single channel with multiple listeners

### Network Debugging

#### **API Call Inspection**:
```typescript
// Add request interceptor for debugging
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  console.log('Fetch Request:', args);
  const response = await originalFetch(...args);
  console.log('Fetch Response:', response.status);
  return response;
};
```

#### **Webhook Testing**:
- Use [ngrok](https://ngrok.com) for local webhook testing
- Forward local port: `ngrok http 54321`
- Update Meta app webhook URL to ngrok URL
- Monitor webhook requests in ngrok dashboard

### Performance Profiling

#### **React Performance**:
```typescript
// Wrap expensive operations
import { Profiler } from 'react';

<Profiler id="ConversationList" onRender={(id, phase, actualDuration) => {
  console.log(`${id} ${phase} took ${actualDuration}ms`);
}}>
  <ConversationList />
</Profiler>
```

#### **Bundle Size Analysis**:
```bash
# Analyze production build
npm run build
npx vite-bundle-visualizer
```

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
- Check function logs in Supabase dashboard: `supabase functions logs <function-name>`
- Check function logs in real-time: `supabase functions logs <function-name> --follow`
- Verify environment variables are set in Supabase Edge Functions settings
- Test locally with Supabase CLI before deploying:
  ```bash
  # Serve all functions locally with hot reload
  supabase functions serve

  # Serve a specific function
  supabase functions serve <function-name>

  # Test function with curl
  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/<function-name>' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json' \
    --data '{"key":"value"}'
  ```
- Debug with console logs: `console.log()` output appears in function logs
- Use Deno's built-in debugger: Set breakpoints and use `--inspect` flag

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

Recent migrations:
- `20241014_create_channel_accounts.sql`: Initial channel accounts structure
- `20241015_002_ensure_profiles.sql`: Ensures user profiles are created
- `20241016_create_members_table.sql`: Member roles and organization relationships
- `20241017_create_places_and_prospects.sql`: Google Places prospecting tables
- `20241018_fix_prospects_org_reference.sql`: Fix organization references in prospects
- `20241019_recreate_prospects_table.sql`: Recreate prospects with correct schema
- `20241020_add_crm_pipeline.sql`: Add CRM pipeline stages and cards
- `20241021_add_channel_type_to_messages.sql`: Add channel type field to messages
- `20241022_create_messages_table.sql`: Create messages table structure
- `20241023_fix_messages_table.sql`: Fix messages table schema
- `20241024_create_insert_message_function.sql`: Add database function for inserting messages
- `20241025_ensure_messages_structure.sql`: Ensure proper messages table structure
- `20241026_001_create_attendants_system.sql`: Create attendants and sessions tables
- `20241026_002_add_channel_type_to_conversations.sql`: Add channel type to conversations
- `20241027_ensure_default_org.sql`: Ensure default organization exists
- `20241027_fix_members_rls_recursion.sql`: Fix RLS policy recursion issues
- `20241028_001_add_channel_type_to_conversations.sql`: Additional channel type updates

## Important Notes

- Development server runs on port 8080 (not default 5173)
- Project uses SWC for fast refresh instead of Babel
- Lovable integration via `lovable-tagger` plugin in development mode
- All database types are auto-generated - don't edit `types.ts` manually
- This project is managed through Lovable (https://lovable.dev) - changes can be made locally or via Lovable interface
- Git repository: https://github.com/agenciapixel/connect-ia.git

### Local Supabase Ports
When running Supabase locally (`supabase start`):
- **Studio**: http://127.0.0.1:54323 (Database management UI)
- **API**: http://127.0.0.1:54321 (REST API endpoint)
- **Database**: Port 54322 (PostgreSQL direct connection)
- **Inbucket** (Email testing): http://127.0.0.1:54324 (View test emails)
- **Edge Functions Inspector**: Port 8083 (Chrome debugger)

### Edge Functions Configuration
- **Deno Version**: 2 (configured in `supabase/config.toml`)
- **Runtime Policy**: `per_worker` (enables hot reload during development)
- **Alternative Policy**: `oneshot` (fallback if hot reload causes issues in large repos)
- Edge Functions use Deno runtime, not Node.js - use Deno-compatible packages only

### Additional Documentation
- Comprehensive Portuguese documentation available in [DOCUMENTACAO_COMPLETA.md](DOCUMENTACAO_COMPLETA.md)
- Includes detailed API documentation, integration guides, and troubleshooting

## Quick Reference: Common Development Tasks

### Creating a New Org-Scoped Feature

```typescript
// 1. Import org context
import { useOrganization } from "@/contexts/OrganizationContext";

// 2. Get current org
const { currentOrg } = useOrganization();

// 3. Create query with org filtering
const { data, isLoading } = useQuery({
  queryKey: ['my-feature', currentOrg?.id],
  queryFn: async () => {
    if (!currentOrg?.id) return [];

    const { data, error } = await supabase
      .from('my_table')
      .select('*')
      .eq('org_id', currentOrg.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  enabled: !!currentOrg?.id, // Prevent query without org
  refetchInterval: 30000 // Optional: real-time updates
});

// 4. Create mutation for insert
const createMutation = useMutation({
  mutationFn: async (newData: MyType) => {
    const { error } = await supabase
      .from('my_table')
      .insert({
        ...newData,
        org_id: currentOrg?.id // Always include org_id
      });

    if (error) throw error;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['my-feature', currentOrg?.id] });
    toast.success("Item criado com sucesso!");
  }
});
```

### Sending a WhatsApp Message

```typescript
import { sendWhatsAppMessage } from "@/lib/whatsapp";

// Send message
await sendWhatsAppMessage({
  to: "+5511999999999", // E.164 format
  message: "Olá! Como posso ajudar?",
  channelId: "channel-uuid",
  orgId: currentOrg.id
});
```

### Assigning a Conversation to an Attendant

```typescript
import { useAttendants } from "@/hooks/useAttendants";

const { assignConversation, findBestAttendant } = useAttendants(currentOrg?.id);

// Manual assignment
assignConversation({
  conversationId: "conv-uuid",
  attendantId: "attendant-uuid",
  notes: "VIP customer - high priority"
});

// Auto-assignment (smart algorithm)
const bestAttendant = findBestAttendant(conversation);
if (bestAttendant) {
  assignConversation({
    conversationId: conversation.id,
    attendantId: bestAttendant.id
  });
}
```

### Creating a Real-time Subscription

```typescript
import { useEffect } from 'react';

useEffect(() => {
  if (!currentOrg?.id) return;

  const channel = supabase
    .channel(`org-${currentOrg.id}-messages`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `org_id=eq.${currentOrg.id}`
    }, (payload) => {
      console.log('New message:', payload.new);
      // Update UI with new message
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    })
    .subscribe();

  // Cleanup on unmount
  return () => {
    channel.unsubscribe();
  };
}, [currentOrg?.id]);
```

### Testing an AI Agent

```typescript
const testAgent = async (agentId: string, message: string) => {
  const { data, error } = await supabase.functions.invoke('ai-agent-chat', {
    body: {
      agentId,
      message,
      conversationId: 'optional-conversation-id',
      contactId: 'optional-contact-id'
    }
  });

  if (error) throw error;

  console.log('AI Response:', data.response);
  console.log('Context Used:', data.contextUsed);
  console.log('History Messages:', data.historyMessages);

  return data.response;
};
```

### Creating a Campaign Flow

```typescript
const campaignSteps = [
  {
    id: '1',
    type: 'message',
    name: 'Welcome Message',
    config: {
      message: 'Olá! Bem-vindo à nossa campanha.'
    }
  },
  {
    id: '2',
    type: 'delay',
    name: 'Wait 1 day',
    config: {
      delay: 1,
      delayUnit: 'days'
    }
  },
  {
    id: '3',
    type: 'condition',
    name: 'Check Response',
    config: {
      condition: 'has_responded'
    }
  },
  {
    id: '4',
    type: 'message',
    name: 'Follow-up',
    config: {
      message: 'Obrigado pela sua resposta!'
    }
  }
];

// Save flow
await supabase
  .from('campaigns')
  .update({ flow: campaignSteps })
  .eq('id', campaignId);
```

### Searching Google Places

```typescript
import { searchGooglePlaces } from "@/lib/googlePlaces";

// Text search
const results = await searchGooglePlaces({
  query: "restaurants in São Paulo",
  location: "São Paulo, Brazil",
  type: "restaurant",
  orgId: currentOrg.id
});

// Nearby search (GPS)
const nearbyResults = await searchGooglePlaces({
  query: "coffee shops",
  latitude: -23.5505,
  longitude: -46.6333,
  radius: 5000, // meters
  orgId: currentOrg.id
});
```

### Formatting Phone Numbers

```typescript
import { formatWhatsAppNumber, isValidWhatsAppNumber } from "@/lib/whatsapp";

const phone = "(11) 99999-9999";

// Check validity
if (isValidWhatsAppNumber(phone)) {
  // Format to E.164
  const formatted = formatWhatsAppNumber(phone); // +5511999999999

  // Send message
  await sendWhatsAppMessage({
    to: formatted,
    message: "Hello!",
    channelId: channelId,
    orgId: currentOrg.id
  });
}
```

### Managing Attendant Sessions

```typescript
import { useAttendants } from "@/hooks/useAttendants";

const { startSession, endSession, activeSessions } = useAttendants(currentOrg?.id);

// Start a work session
startSession(attendantId);

// End a session
endSession(sessionId);

// View all active sessions
console.log('Active Sessions:', activeSessions);
```

### Updating Attendant Status

```typescript
import { useAttendants } from "@/hooks/useAttendants";

const { updateAttendantStatus } = useAttendants(currentOrg?.id);

// Change status
updateAttendantStatus({
  id: attendantId,
  status: 'online' // 'online' | 'busy' | 'away' | 'offline' | 'break' | 'training'
});
```

### Handling Form Validation with Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  department: z.enum(["atendimento", "vendas", "suporte"])
});

const form = useForm({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    email: "",
    phone: "",
    department: "atendimento"
  }
});

const onSubmit = async (values: z.infer<typeof formSchema>) => {
  // Form is validated automatically
  console.log(values);
};
```

## UI Components Reference

### Key shadcn/ui Components Used

The project heavily uses shadcn/ui components. Here are the most commonly used:

- **Forms**: `Form`, `FormField`, `FormControl`, `FormLabel`, `FormMessage`
- **Inputs**: `Input`, `Textarea`, `Select`, `Switch`, `Checkbox`, `Slider`
- **Dialogs**: `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`
- **Layout**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `Separator`
- **Navigation**: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- **Feedback**: `Badge`, `Alert`, `Skeleton`, `Progress`
- **Overlays**: `DropdownMenu`, `Popover`, `Tooltip`, `Sheet`
- **Data Display**: `Table`, `Avatar`, `ScrollArea`

### Styling Patterns

```typescript
// Use cn() for conditional classes
import { cn } from "@/lib/utils";

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  hasError && "error-classes"
)} />

// Common patterns
<Card className="hover:shadow-lg transition-shadow">
<Button variant="outline" size="sm" className="gap-2">
<Badge variant="destructive">Error</Badge>
```
