# Retirement Funds Management System

## Overview

This is a full-stack web application for managing retirement funds with a modern React frontend and Express.js backend. The system provides multiple viewing modes (grouped table, cards, detailed) for retirement fund data with real-time editing capabilities and search functionality.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **State Management**: TanStack Query for server state

## Key Components

### Frontend Architecture
- **Component Structure**: Modern React with TypeScript using functional components and hooks
- **UI System**: Shadcn/ui component library providing consistent design patterns
- **Styling**: Tailwind CSS with custom design tokens and responsive design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, local React state for UI state

### Backend Architecture
- **API Structure**: RESTful Express.js server with TypeScript
- **Database Layer**: Drizzle ORM with PostgreSQL dialect
- **Data Storage**: Dual implementation (MemStorage for development, database for production)
- **Middleware**: Custom logging, error handling, and request parsing

### Database Schema
- **Primary Entity**: `retirement_funds` table with comprehensive financial fields
- **Field Types**: Mixed string and decimal fields for financial data
- **Validation**: Zod schemas for runtime type checking
- **Migrations**: Drizzle migrations system for schema management

## Data Flow

1. **Client Requests**: React components use TanStack Query hooks to fetch data
2. **API Routing**: Express routes handle CRUD operations for retirement funds
3. **Data Validation**: Zod schemas validate incoming data before processing
4. **Storage Layer**: Abstracted storage interface supports both memory and database backends
5. **Real-time Updates**: Optimistic updates with automatic query invalidation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver
- **drizzle-orm**: Type-safe ORM with PostgreSQL support
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **wouter**: Lightweight React router

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Fast JavaScript bundler for production

## Deployment Strategy

### Development
- **Hot Reload**: Vite dev server with Express middleware integration
- **Type Checking**: Continuous TypeScript compilation
- **Memory Storage**: In-memory data store for rapid development

### Production
- **Build Process**: Vite builds frontend, ESBuild bundles backend
- **Static Serving**: Express serves built frontend assets
- **Database**: PostgreSQL with connection pooling
- **Environment**: NODE_ENV-based configuration switching

### Configuration
- **Database**: Environment variable-based DATABASE_URL configuration
- **Build Outputs**: Separate dist directories for client and server
- **Asset Handling**: Vite handles asset optimization and bundling

## User Preferences

Preferred communication style: Simple, everyday language.

## Current State (Checkpoint - July 09, 2025)

The application has been comprehensively optimized and streamlined for production deployment. The system operates with two primary view modes optimized for performance and maintainability:

1. **Grouped Table View**: High-performance table interface with optimized rendering
2. **Detailed (Hybrid) View**: Accordion-style interface with memoized components

### Key Features Implemented:
- **Dual View System**: Table and Hybrid views with smooth transitions
- **Column Visibility Controls**: Optimized toggle system for data sections
- **Table/Flows Mode Toggle**: Efficient switching between input and flow calculations
- **Flows Table**: Complete flows table with real-time totals calculation
- **Search Functionality**: Memoized real-time fund search across multiple fields
- **Consistent Styling**: Unified design system with optimized CSS
- **Responsive Design**: Mobile-optimized interface with adaptive layouts
- **Real-time Updates**: Optimistic updates with TanStack Query
- **Performance Optimization**: Comprehensive React.memo, useCallback, useMemo implementation
- **Clean Architecture**: Streamlined codebase with minimal redundancy

### Architecture Highlights:
- **Optimized Component Structure**: Memoized components with efficient re-rendering
- **Type Safety**: Complete TypeScript coverage with Zod validation
- **Modern Tech Stack**: React 18, Vite, Tailwind CSS, Shadcn/ui
- **Efficient State Management**: TanStack Query with comprehensive memoization
- **Database Ready**: PostgreSQL schema with Drizzle ORM
- **Production Optimized**: Minimized bundle size, optimized animations, clean CSS
- **Responsive Layout**: Adaptive grid system for all devices

## Optimization Summary (July 07, 2025):

### Performance Enhancements:
- **React.memo**: Applied to DetailedRow component for optimal re-rendering
- **useCallback**: Memoized event handlers and field update functions
- **useMemo**: Optimized search filtering and data computations
- **Component Optimization**: Reduced unnecessary re-renders across view transitions

### Layout Improvements:
- **Responsive Grid System**: Dynamic column layout (1/2/4/6 columns)
- **Space Efficiency**: Maximized screen real estate utilization
- **Mobile Optimization**: Improved stacked layout for small screens
- **Adaptive Spacing**: Responsive padding and gaps

### Code Quality:
- **Clean Architecture**: Streamlined component structure
- **Type Safety**: Enhanced TypeScript coverage
- **Import Optimization**: Removed unused dependencies
- **Performance Monitoring**: Added memoization where beneficial

## Removed Components (Cleanup):
- Cards view system (cards-view.tsx, fund-card.tsx)
- Legacy table components with interface conflicts
- Unused imports and deprecated code paths

## Changelog

Changelog:
- July 01, 2025: Initial setup
- July 02, 2025: Updated all input field content to right-align text across all view modes for consistent data presentation  
- July 04, 2025: **CHECKPOINT** - Removed Cards view entirely, applied consistent teal styling to all hybrid view sections, cleaned up codebase for production readiness
- July 07, 2025: **CHECKPOINT** - Optimized hybrid view layout with responsive grid (1/2/4/6 columns), enhanced performance with React.memo and useCallback, improved code structure and maintainability
- July 08, 2025: **FLOWS TABLE** - Added complete flows table for table view only, follows exact patterns and styles of inputs table with dedicated summary section
- July 08, 2025: **COMPACT STYLING & BOLD TOTALS** - Implemented compact cell spacing matching dropdown heights, applied proper bold styling (font-weight: 700) to total rows with explicit font family overrides
- July 09, 2025: **MAJOR CLEANUP & OPTIMIZATION** - Comprehensive code cleanup with performance optimizations including React.memo, useCallback, useMemo for enhanced rendering efficiency, removed unused CSS classes, streamlined component structure
- July 09, 2025: **INPUT FIELD SIZING OPTIMIZATION** - Fixed AutoSizeInput component with Canvas API text measurement for accurate content-based sizing, eliminated text truncation issues, maintained 80px percentage column width
- July 09, 2025: **ACTIONS COLUMN OPTIMIZATION** - Restricted Actions column to only appear in Unapproved Life Cover section, removed from Monthly Death Benefit, Fund Value, and Fund Value Beneficiaries sections for cleaner table layout
- July 09, 2025: **OVERVIEW STYLING FIX** - Fixed AutoSizeInput component to properly apply background styling, enhanced table-input CSS with hover/focus states, fixed Owner field width to prevent truncation with min-width 120px
- July 09, 2025: **BENEFICIARY FONT SIZE FIX** - Standardized all beneficiary name fields to use table-input class ensuring consistent font size (0.875rem) across main and additional beneficiary rows
- July 09, 2025: **ACTION ICON COLORS** - Updated action icon colors to #1B5C82 for add (+) buttons and #4F4F4F for delete (trash) buttons with matching hover states
- July 09, 2025: **FLOWS TABLE RESTORATION** - Fixed JSX structure errors in flows table, restored proper table mode switching between SimpleTableWithBeneficiaries (inputs) and NewGroupedTableView (flows), confirmed working table mode toggle functionality
- July 09, 2025: **HYBRID VIEW LAYOUT OPTIMIZATION** - Redesigned hybrid view card layout with better field organization, limited grid widths with max-width constraints, improved spacing with proper grouping, replaced confusing full-width stretching with organized sections (2-4 columns max), enhanced readability with better label positioning
- July 09, 2025: **HYBRID VIEW AUTOSIZING** - Added AutoSizeInput component to hybrid view fields using Canvas API for accurate text measurement, fields now automatically size to fit content with 120px minimum and 300px maximum width constraints, improved field organization and visual consistency
- July 09, 2025: **COMPACT BENEFICIARY LAYOUT** - Created compact layout mode for beneficiary sections in hybrid view, replaced full-width grid with flexible layout using fixed widths for better space utilization, maintained all functionality while preventing confusing stretching
- July 09, 2025: **SPLIT-PANE HYBRID VIEW** - Redesigned hybrid view with split-pane layout: left sidebar shows fund list with key info, right panel shows detailed sections for selected fund, eliminates scrolling issues with many funds, more efficient screen space usage
- July 09, 2025: **HYBRID VIEW SCROLL FIX** - Removed scrollable containers in hybrid view, implemented sticky headers for fund list and detail panel, allows natural page scrolling for better user experience
- July 09, 2025: **UNIFIED COLUMN LAYOUT** - Standardized all hybrid view sections to consistent responsive grid: 1 column mobile, 4 columns tablet, 8 columns desktop, filling from left, removed max-width constraints for full utilization