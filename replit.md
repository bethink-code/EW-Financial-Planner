# Retirement Funds Management System

## Overview
This is a full-stack web application for managing retirement funds. It provides robust capabilities for viewing, editing, and searching retirement fund data through a modern React frontend and an Express.js backend. The system supports multiple viewing modes, including grouped table, cards, and detailed views, with real-time editing and search functionalities. The project's vision is to provide a comprehensive and intuitive platform for financial planning, with high market potential in personal and professional financial management.

## Recent Major Accomplishments
- **January 2025**: Completed Global Hybrid View Pattern framework with comprehensive implementation guide
- **Border Management**: Resolved all double border issues across hybrid view interfaces with proper CSS classes and component props
- **Pattern Documentation**: Created `GLOBAL_HYBRID_VIEW_PATTERN.md` - definitive guide for implementing hybrid views in any new calculator
- **Universal Field Groupings**: Established 4 reusable logical groupings adaptable across all financial calculators
- **CSS Framework**: Added hybrid view CSS classes for consistent tab styling and border management
- **Implementation Template**: Both Assurance and Retirement Funds serve as working examples of the complete pattern

## User Preferences
Preferred communication style: Simple, everyday language.

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
- **Color Scheme**: Consistent design system with specific colors for primary actions, accents, and backgrounds (e.g., orange for active navigation, light blue for summary cards, light grey for page background).
- **Layout**: Unified single-row navigation at the top. Dual view system (Table and Hybrid) with smooth transitions. Responsive grid system (1/2/4/6 columns).
- **Typography**: Standardized font sizes, weights, and uppercase formatting for headers and labels.
- **Input Fields**: Uncontrolled HTML inputs with `defaultValue` and `onBlur` for consistent text capture and formatting (currency, percentage, years).
- **Table Design**: Compact cell spacing, bold totals, standardized headers, ultra-clean section borders, and horizontal row borders.
- **Calculated Fields**: Transparent background, no borders, non-selectable text for calculated values, using a global `.calculated-field` class.
- **Default Values**: Grey styling for default text (e.g., "Enter details...", "0%", "R 0").

### Feature Specifications
- **Dual View System**: Table and Hybrid views.
- **Search Functionality**: Memoized real-time fund search across multiple fields.
- **Real-time Updates**: Optimistic updates with TanStack Query.
- **Multi-Level Navigation**: Hierarchical navigation structure (Financial Plan > Needs > Steps > Calculators/Sections) with consolidated header bar.
- **Project Navigation**: Direct navigation to Project step without dropdown menus, linking to graphs and projections.
- **Graph Tab Switcher**: Compact, content-sized tab navigation for Overview, Estate Position, Dependants Position, Total Capital Position, and Income Position graphs.
- **Multiple Owners/Beneficiaries**: Support for multiple owners and beneficiaries with CRUD operations and percentage splits.
- **Comprehensive Formatting**: System-wide consistent formatting for currency, percentages, and years.
- **Table Stability**: Implementation of patterns like `React.Fragment` with stable keys, debounced updates for text fields, immediate updates for array operations, and proper `rowSpan` usage.
- **Global Entity Management System**: Dynamic entity management with percentage validation and automatic Primary entity defaults across major calculation tables. This includes reusable global components for owner/beneficiary selection and primary entity default utility functions.
- **Years/% Toggle Pattern**: Reusable toggle pattern for specific fields to switch between year and percentage input, successfully implemented in Defined Benefit Funds and Assurance tables. In Assurance, each beneficiary row has independent toggle controls with per-beneficiary arrays (amountToggles, amountYearsValues, amountIncreaseValues) for Amount field toggle functionality. Pattern includes Elite Wealth blue styling, automatic array synchronization during beneficiary add/remove operations, and proper validation helper functions.
- **Global Loading System**: Comprehensive loading indicators with Elite Wealth primary blue branding, providing visual feedback during CRUD operations through a global progress bar and enhanced loading mutations.
- **Global Hybrid View Pattern**: Battle-tested implementation framework with mandatory protocols in `GLOBAL_HYBRID_VIEW_PATTERN.md`. Provides 80% reusable infrastructure with strict border management rules (`isFirst`/`isLast` props required), no-spacing tab containers, clean detail forms, and 4 universal field groupings. Includes implementation checklist, visual testing protocol, and copy-paste templates. Successfully deployed across Assurance and Retirement Funds with zero border issues. Preview cards use separate lines (`\n`) for multiple entity types (e.g., "Cover Beneficiaries: 2\nFund Beneficiaries: 1") for improved readability. Global CSS fixes prevent double borders at table bottoms. **Title Styling Standards**: Mandatory typography pattern (`text-lg font-semibold text-neutral-800`) ensures consistent individual item name display across all calculators, with header layout including title left and action buttons right.

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