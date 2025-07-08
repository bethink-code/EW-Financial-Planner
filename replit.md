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

## Current State (Checkpoint - July 07, 2025)

The application has been successfully streamlined with the Cards view completely removed and consistent styling applied throughout. The system now operates with two primary view modes:

1. **Grouped Table View**: Comprehensive table interface with collapsible sections
2. **Detailed (Hybrid) View**: Accordion-style interface with expandable fund details

### Key Features Implemented:
- **Dual View System**: Table and Hybrid views with seamless switching
- **Column Visibility Controls**: Toggle different data sections on/off
- **Table/Flows Mode Toggle**: Switch between input mode and flow calculations
- **Search Functionality**: Real-time fund search across multiple fields
- **Consistent Styling**: Unified teal-themed section styling across all views
- **Responsive Design**: Mobile-optimized interface with adaptive column grids
- **Real-time Updates**: Optimistic updates with TanStack Query
- **Advanced Grid Layout**: Responsive grid system (1/2/4/6 columns) for maximum space efficiency
- **Performance Optimization**: React.memo, useCallback, and useMemo for enhanced performance

### Architecture Highlights:
- **Clean Component Structure**: Modular, reusable components with React.memo optimization
- **Type Safety**: Full TypeScript coverage with Zod validation
- **Modern Tech Stack**: React 18, Vite, Tailwind CSS, Shadcn/ui
- **Efficient State Management**: TanStack Query for server state with memoized operations
- **Database Ready**: PostgreSQL schema with Drizzle ORM
- **Performance Optimized**: Memoized components, callbacks, and computed values for optimal rendering
- **Responsive Layout**: Adaptive grid system optimized for all screen sizes

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