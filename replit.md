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

## Changelog

Changelog:
- July 01, 2025. Initial setup