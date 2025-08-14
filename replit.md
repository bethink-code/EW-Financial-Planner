# Retirement Funds Management System

## Overview
This full-stack web application, built with a React frontend and an Express.js backend, manages retirement funds and comprehensive financial planning data. It features 9 calculator views (assets, liabilities, defined benefit funds, assurance, retirement funds, income needs, lump sum bequests, income provisions, voluntary investments) with robust capabilities for viewing, editing, and searching financial data. The application supports multiple viewing modes including grouped table and hybrid views with real-time functionalities, standardized navigation patterns, and consistent UI alignment across all calculator components.

## User Preferences
- Preferred communication style: Simple, everyday language.
- **CRITICAL**: Always run changes past the user first before implementing them. Never make changes without explicit approval.
- User wants to be consulted on all modifications before they are executed.

## System Architecture
The application is structured as a monorepo, separating client, server, and shared components.

### Frontend Architecture
- **Framework & Language**: React with TypeScript.
- **Build System**: Vite.
- **UI Framework**: Shadcn/ui components with Tailwind CSS (custom design tokens and responsive design).
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query for server state; local React state for UI state.
- **Component Structure**: Functional components and hooks, optimized for performance.

### Backend Architecture
- **API**: RESTful Express.js server with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Data Storage**: Database-first architecture; falls back to in-memory storage (`MemStorage`) for development.
- **Middleware**: Custom logging, error handling, and request parsing.
- **Database Connectivity**: Standard PostgreSQL driver with connection pooling.

### Database Schema
- **Primary Entity**: `retirement_funds` table with comprehensive financial fields.
- **Field Types**: Mixed string and decimal fields, validated using Zod schemas.
- **Migrations**: Drizzle migrations system for schema management. Arrays in the database schema (e.g., `owners`, `beneficiaries`, `ownershipPercentages`) are configured with default values.

### Data Flow
Client requests data via TanStack Query hooks. Express routes handle CRUD operations, validating data with Zod schemas. Data is stored via an abstracted storage interface. Real-time updates utilize optimistic updates with query invalidation.

### UI/UX Decisions
- **Color Scheme**: Consistent design system with specific colors for primary actions (orange), accents (light blue for summary cards), and backgrounds (light grey for page background).
- **Layout**: Unified single-row navigation at the top. Dual view system (Table and Hybrid) with smooth transitions. Responsive grid system (1/2/4/6 columns).
- **Typography**: Standardized font sizes, weights, and uppercase formatting for headers and labels.
- **Input Fields**: Uncontrolled HTML inputs with `defaultValue` and `onBlur` for consistent text capture and formatting (currency, percentage, years).
- **Table Design**: Compact cell spacing, bold totals, standardized headers, ultra-clean section borders, and horizontal row borders.
- **Calculated Fields**: Transparent background, no borders, non-selectable text for calculated values, using a global `.calculated-field` class.
- **Default Values**: Grey styling for default text (e.g., "Enter details...", "0%", "R 0").

### Feature Specifications
- **Dual View System**: Table and Hybrid views with global view mode persistence using `localStorage`.
- **Search Functionality**: Memoized real-time fund search across multiple fields.
- **Real-time Updates**: Optimistic updates with TanStack Query.
- **Multi-Level Navigation**: Hierarchical navigation structure with consolidated header bar and direct project navigation.
- **Graph Tab Switcher**: Compact, content-sized tab navigation for various financial positions.
- **Multiple Owners/Beneficiaries**: Support for multiple owners and beneficiaries with CRUD operations, percentage splits, and a Global Entity Management System.
- **Comprehensive Formatting**: System-wide consistent formatting for currency, percentages, and years.
- **Table Stability**: Implementation of patterns like `React.Fragment` with stable keys, debounced updates for text fields, immediate updates for array operations, and proper `rowSpan` usage.
- **Years/% Toggle Pattern**: Reusable toggle for specific fields to switch between year and percentage input, including Elite Wealth blue styling and automatic array synchronization.
- **Global Loading System**: Comprehensive loading indicators with Elite Wealth primary blue branding, providing visual feedback during CRUD operations through a global progress bar and enhanced loading mutations.
- **Global Hybrid View Pattern**: A battle-tested implementation framework with mandatory protocols, providing 80% reusable infrastructure with strict border management rules (`isFirst`/`isLast` props), no-spacing tab containers, clean detail forms, and 4 universal field groupings (Overview, Main Details, Additional/Specialized, Beneficiaries). Includes a consistent Add Button Pattern at the top of tab sections. Preview cards use separate lines (`\n`) for multiple entity types.
- **Global EntitySelector Pattern**: Critical implementation rule: `EntityOwnerSelector` and `EntityBeneficiarySelector` components render their own `<td>` elements and must never be wrapped in additional `<td>` elements.
- **EntitySelector Spacing Optimization**: Implemented horizontal spacing optimization using asymmetric padding for cohesive UI units.
- **Hybrid View Column Spacing Pattern**: Global spacing optimization for side-by-side column layouts in hybrid view detail forms (`gap-x-3` with `width: fit-content`).
- **Preview Card Data Consistency Pattern**: Resolved owner/beneficiary count mismatches by implementing consistent empty string filtering across all preview card components.
- **Hybrid View Width Alignment Pattern**: Universal implementation across all 9 calculator components with `w-[1320px]` constraint to perfectly align with navigation element. Pattern structure: `<div className="w-full px-6 py-6"><div className="w-[1320px]">[Content]</div></div>` ensures consistent layout and professional appearance while table view can extend horizontally.
- **Navigation Context Fixes**: Resolved routing confusion with improved default route handling, enhanced step detection for calculator pages in "build" step, and fixed sequential navigation matching to prevent context loss when using bottom navigation arrows.

## External Dependencies

### Core Libraries
- **drizzle-orm**: Type-safe ORM for PostgreSQL.
- **@tanstack/react-query**: Server state management library.
- **@radix-ui/**: Accessible UI primitives.
- **wouter**: Lightweight React router.

### UI/Styling
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/ui**: Component library built on Radix UI and Tailwind CSS.

### Development Tools
- **Vite**: Fast build tool with HMR support.
- **TypeScript**: For type safety across the stack.
- **ESBuild**: Fast JavaScript bundler for backend production builds.