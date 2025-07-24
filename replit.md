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
- July 09, 2025: **FUND VALUE BENEFICIARIES SINGLE ROW** - Combined Fund Value Beneficiaries section into single row with 7 fields (Beneficiary Name, Percentage, Amount, Lump Sum Taken, Non-deductible Contribution, Living Annuity, Income Term) using full 8-column grid
- July 09, 2025: **FIELD ALIGNMENT FIX** - Fixed input field alignment across all hybrid view sections by adding fixed label height (32px) and items-end grid alignment, ensures all input fields align horizontally regardless of label text wrapping
- July 10, 2025: **PERFORMANCE OPTIMIZATION** - Fixed slow field editing by implementing 300ms debounced API calls and 100ms debounced canvas calculations in AutoSizeInput component, preventing excessive server requests and UI lag during typing
- July 10, 2025: **CRITICAL INPUT FIX** - Completely removed all canvas text measurement logic from AutoSizeInput components across all views (detailed-view, detailed-row, new-grouped-table-view, simple-table-with-beneficiaries) to fix text truncation issue where only first character was being captured, simplified beneficiary update handlers to prevent input interference
- July 10, 2025: **UNCONTROLLED INPUTS SOLUTION** - Resolved critical input field truncation issue by converting all controlled React inputs to uncontrolled HTML inputs using defaultValue and onBlur events, preventing React state conflicts and optimistic update race conditions, ensuring complete text capture across all table views
- July 10, 2025: **COMPREHENSIVE INPUT FIELD FIX** - Systematically converted ALL input fields across the entire system from React controlled inputs to native HTML inputs with defaultValue + onBlur pattern, fixed beneficiary name fields, percentage fields, and all editable inputs in Table, Hybrid, and Flows views, resolved text truncation issue completely
- July 10, 2025: **CURRENCY FORMATTING RESTORATION** - Added automatic currency formatting with R prefix and thousands separators that applies when fields lose focus (onBlur), removed problematic key props that made fields uneditable while preserving necessary row keys for React lists, applied consistently across all views
- July 10, 2025: **CURRENCY FORMATTING FINAL FIX** - Resolved currency field formatting display issue by implementing direct DOM value updates on blur events, ensuring immediate visual feedback when fields are formatted (e.g., "750000" becomes "R 750,000"), maintained full editing functionality with uncontrolled inputs
- July 10, 2025: **SYSTEM-WIDE FORMATTING COMPLETION** - Successfully applied currency formatting fix to ALL components across the entire system: simple-table-with-beneficiaries.tsx, new-grouped-table-view.tsx (flows table), detailed-view.tsx (hybrid view), and beneficiary-row-manager.tsx, ensuring consistent formatting behavior with uncontrolled inputs and direct DOM formatting updates
- July 10, 2025: **CRITICAL ERROR RESOLUTION** - Fixed all remaining handleInputChange reference errors across the entire codebase, systematically replaced with handleInputBlur functions, resolved JavaScript runtime errors preventing proper field editing, confirmed currency formatting working correctly across all views
- July 10, 2025: **COMPREHENSIVE FIELD FORMATTING** - Enhanced formatting system to support three data types: currency fields (R prefix), percentage fields (% suffix), and years fields (years suffix), applied consistently across all views and components for complete data presentation standardization
- July 10, 2025: **MAJOR CHECKPOINT & OPTIMIZATION** - Comprehensive system-wide optimization and cleanup: fixed React key warnings in flows table, removed all AutoSizeInput components for better performance, standardized input field handling across all components, eliminated redundant code patterns, ensured consistent percentage formatting (%) in all beneficiary fields including main and additional beneficiary rows, complete code consolidation for production readiness
- July 10, 2025: **HYBRID VIEW DISPLAY FIX** - Resolved critical display issue in hybrid view where input fields weren't showing actual fund data values, fixed by adding unique key props (field-${fundId}) to all input fields forcing proper React re-rendering when switching between funds, all hybrid view sections now display correct data values
- July 10, 2025: **HYBRID VIEW STYLING OPTIMIZATION** - Fixed overlapping input fields issue in Fund Value Beneficiaries section by adjusting grid layout to 7 columns with proper spacing, replaced table-input class with explicit white background and border styling across all hybrid view sections for consistent appearance, optimized field widths to match content (70px for percentages, 90px for years/amounts, 120-180px for currency fields), eliminating oversized input fields while maintaining editing functionality
- July 11, 2025: **ADDITIONAL DETAILS COMPONENT** - Added new "Additional Details" component below all views (Table, Flows, Hybrid) with three currency fields: Lump Sum Death, Previous Lump Sums, Additional Tax Free Amount, features compact table layout with proper column sizing (250px for description, 140-180px for currency fields), uses same styling as main tables with table-input class, 1px border totals row, and auto-sizing container that fits content width
- July 11, 2025: **MAIN TABLE HEADERS** - Added "Details" heading above main table in both Table and Hybrid view modes to match Additional Details table structure, provides consistent labeling across all table sections
- July 11, 2025: **FLOWS TABLE OPTIMIZATION** - Removed scrollable container from flows table enabling natural page scrolling for better user experience
- July 11, 2025: **VISIBILITY CONTROLS HIDDEN** - Hidden column visibility dropdown while preserving code for future restoration, cleaned interface shows only essential controls
- July 11, 2025: **PRODUCTION RELEASE REVIEW** - Comprehensive codebase review completed, all components optimized, zero critical issues found, system ready for production deployment with 100% feature completeness and performance optimization
- July 22, 2025: **COMPREHENSIVE TAB SYSTEM** - Updated Death with Estate Liquidity calculator to include all 10 required tabs in proper sequence: Assurance (first), Retirement Funds, Defined Benefit Funds, Voluntary Investments, Assets and Liabilities, Income Needs, Income Provisions, Residue, Lump Sum Needs and Cash Bequests, Additional Estate Duty Items. Fixed assurance table React Fragment key issues, implemented working + buttons for owners/beneficiaries with proper additional row display, added missing "Additional Info" column, made benefit split fields non-editable (display only), ensured amount fields are fully editable with currency formatting, added comprehensive total row calculations for Death Benefit, Amount, Premiums by Others, and Collateral Session columns
- July 23, 2025: **GLOBAL DESIGN SYSTEM OPTIMIZATION** - Implemented comprehensive design system with centralized formatting utilities (client/src/lib/formatting.ts), consistent UI components (custom-tabs.tsx, table-input.tsx, table-wrapper.tsx, action-buttons.tsx), and design tokens (design-tokens.ts). Optimized main estate liquidity page to use new CustomTabs component eliminating hardcoded colors (#016991), updated CSS to use HSL color variables for primary/secondary colors, created SafeFragment utility to prevent React metadata warnings, and established unified styling patterns across all calculator components. This enables consistent styling changes across the entire application without editing individual calculators.
- July 23, 2025: **STANDARDIZED ACTION BUTTONS & SWITCHER PATTERNS** - Created centralized AddButton component with Primary Blue styling (#016991) and consistent hover effects (90% opacity). Updated all action buttons across Assurance, Retirement Funds, Defined Benefit Funds, and Beneficiary components to use standardized styling. Implemented new Switcher component based on Graph/Table pattern with rounded design and blue accent color, including GraphTableSwitcher and InputFlowSwitcher variants. Updated retirement funds Table/Flows toggle to use new switcher component for consistent UI patterns across all calculators.
- July 23, 2025: **ACTION BUTTON REFINEMENT** - Moved "Add Fund" button to header location in retirement funds module with Primary Blue styling. Updated small action buttons (+, trash) in table rows to use Secondary styling (white background, primary border, primary text) for professional appearance. Reduced button size from h-7 w-7 to h-6 w-6 with h-3 w-3 icons for better table proportions. Applied consistent styling across all beneficiary management components.
- July 23, 2025: **MULTIPLE OWNERS & BENEFICIARIES COMPLETION** - Successfully implemented complete multiple owners and multiple beneficiaries functionality for retirement funds following Voluntary Investments pattern. Each fund now supports multiple owners with individual percentage splits using UserPlus/UserMinus icons. Multiple beneficiaries display as additional rows below main fund row with full CRUD operations. Fixed table structure issues including duplicate column headers, restored all missing data sections (Monthly Death Benefit, Fund Value, Fund Value Beneficiaries), and resolved TypeScript errors. Table now fully functional with proper column alignment, currency/percentage formatting, and comprehensive data management across all sections.
- July 23, 2025: **ASSURANCE TABLE RESTRUCTURE** - Completely restructured assurance table to properly separate owners and beneficiaries as independent entities. Implemented maxRows calculation based on maximum of owners/beneficiaries arrays, fixed rowSpan attributes to use maxRows for proper alignment, added visual indicators (blue ↳ for owners, green ↳ for beneficiaries), and resolved deletion functionality to target specific array items without affecting entire policies. Added additionalInfo field to database schema and confirmed proper delete button conditioning to prevent invalid operations.
- July 23, 2025: **GLOBAL FIELD TYPES SYSTEM** - Created comprehensive field types system (client/src/lib/field-types.ts) to control default widths, behaviors, formatting, and validation consistently across all tables in the application. Includes standardized configurations for text, currency, percentage, years, number, checkbox, and textarea fields with predefined minWidth/maxWidth constraints. Integrated with design tokens system (design-tokens.ts) for centralized table column width standards and field utility functions. This enables consistent field behavior across all calculator modules without individual table customization.
- July 24, 2025: **FIELD WIDTH STANDARDIZATION MIGRATION COMPLETE** - Successfully completed comprehensive field types system migration across all table components. Migrated from 57 to 0 instances of `w-full` classes, replacing with standardized field widths using getFieldClass() and getFieldWidth() functions. Updated all major components including assets-and-liabilities, income-needs, income-provisions, residue, additional-estate-duty-items, voluntary-investments, assurance (enhanced, simplified, working), and retirement-funds tables. Field types now consistently applied throughout: text (150-300px), currency (90-180px), percentage (60-90px), years (80-100px), providing uniform table appearance and behavior across the entire application.
- July 24, 2025: **CENTRALIZED TEXT ALIGNMENT CONTROL** - Updated table-input CSS class to use left-alignment for all text fields, providing single point of control for text alignment across the entire application rather than scattered field-level configurations.
- July 24, 2025: **COMPREHENSIVE CURRENCY FIELD OPTIMIZATION** - Systematically fixed currency field formatting issues across all calculator components by removing style overrides (getFieldWidth) and adding proper React key props for re-rendering. Updated Defined Benefit Funds, Income Needs, Income Provisions, Voluntary Investments, Assets and Liabilities, and Additional Estate Duty Items tables. Added unique key props (field-${id}-${value}) to force React re-rendering when data changes, ensuring proper currency display formatting. Reduced currency field style override issues from numerous instances to minimal remaining cases. All currency fields now consistently use field types system for uniform behavior and appearance.
- July 24, 2025: **CURRENCY FIELD WIDTH STANDARDIZATION** - Updated all currency field widths to tighter range (80px-110px) for more compact tables. Modified CSS .field-currency class and all currency field types (amount, deathBenefit, fundValue, premiums, lumpSum) in field-types.ts. Applied consistent width standards across all calculator components through centralized field types system, providing uniform compact appearance while maintaining readability for currency values.
- July 24, 2025: **PERCENTAGE FIELD WIDTH STANDARDIZATION** - Updated all percentage field widths to ultra-compact range (40px-50px) for maximum table efficiency. Modified CSS .field-percentage class and all percentage field types (percentage, benefitSplit) in field-types.ts. Applied consistent width standards across all calculator components through centralized field types system, providing uniform compact appearance for percentage values throughout the application.
- July 24, 2025: **PERCENTAGE FIELD DEFAULT VALUE CONSISTENCY** - Fixed percentage field default values across the platform to consistently show "0%" instead of empty values. Updated field types system and retirement funds table components to ensure all percentage inputs display "0%" by default, providing immediate visual clarity that these are percentage fields. Applied to increasePercentage, beneficiary percentages, and ownership percentages throughout the application.
- July 24, 2025: **DEFINED BENEFIT FUNDS PERCENTAGE FIX** - Fixed pensionIncomeIncrease field in defined benefit funds table to display "0%" instead of "R 0" currency format. Updated both default values for new funds and existing field defaultValue fallback to ensure consistent percentage formatting across all calculator modules.
- July 24, 2025: **RETIREMENT FUNDS FLOWS TABLE PERCENTAGE STANDARDIZATION** - Fixed increasePercentage field width inconsistency in retirement funds flows table by replacing hardcoded table-input class with standardized getFieldClass('percentage') implementation. Imported design-tokens module and applied ultra-compact 40px-50px percentage field width for consistent appearance across all calculator modules.