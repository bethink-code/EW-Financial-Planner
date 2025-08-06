# Retirement Funds Management System

## Overview
This is a full-stack web application designed for managing retirement funds. It offers a modern React frontend and an Express.js backend, providing robust capabilities for viewing, editing, and searching retirement fund data. The system supports multiple viewing modes, including grouped table, cards, and detailed views, with real-time editing and search functionalities. The project's vision is to provide a comprehensive and intuitive platform for financial planning, with high market potential in personal and professional financial management.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application is structured as a monorepo, separating client, server, and shared components.

### Frontend Architecture
- **Framework & Language**: React with TypeScript.
- **Build System**: Vite.
- **UI Framework**: Shadcn/ui components for consistent design, styled with Tailwind CSS (including custom design tokens and responsive design).
- **Routing**: Wouter for lightweight client-side routing.
- **State Management**: TanStack Query for server state; local React state for UI state.
- **Component Structure**: Functional components and hooks, optimized for performance with `React.memo`, `useCallback`, and `useMemo`.

### Backend Architecture
- **API**: RESTful Express.js server with TypeScript.
- **Database**: PostgreSQL with Drizzle ORM.
- **Data Storage**: Database-first architecture; falls back to in-memory storage (`MemStorage`) for development.
- **Middleware**: Custom logging, error handling, and request parsing.
- **Database Connectivity**: Standard PostgreSQL driver with connection pooling.

### Database Schema
- **Primary Entity**: `retirement_funds` table with comprehensive financial fields.
- **Field Types**: Mixed string and decimal fields, validated using Zod schemas for runtime type checking.
- **Migrations**: Drizzle migrations system for schema management. Arrays in the database schema (e.g., `owners`, `beneficiaries`, `ownershipPercentages`) are configured with default values to ensure proper functionality of action buttons and prevent data corruption.

### Data Flow
Client requests data via TanStack Query hooks. Express routes handle CRUD operations, validating data with Zod schemas. Data is stored via an abstracted storage interface. Real-time updates utilize optimistic updates with query invalidation.

### UI/UX Decisions
- **Color Scheme**: Consistent use of a design system with specific colors for primary actions, accents, and backgrounds (e.g., orange for active navigation, light blue for summary cards, light grey for page background).
- **Layout**: Unified single-row navigation system at the top. Dual view system (Table and Hybrid) with smooth transitions. Responsive grid system (1/2/4/6 columns) for adaptable layouts.
- **Typography**: Standardized font sizes, weights, and uppercase formatting for headers and labels.
- **Input Fields**: Uncontrolled HTML inputs with `defaultValue` and `onBlur` for consistent text capture and formatting (currency, percentage, years).
- **Table Design**: Compact cell spacing, bold totals, standardized headers (single and double row) with vertical alignment, ultra-clean section borders (1px solid grey vertical lines) and horizontal row borders (1px solid grey).
- **Calculated Fields**: Transparent background, no borders, non-selectable text for calculated values, using a global `.calculated-field` class.
- **Default Values**: Grey styling for default text (e.g., "Enter details...", "0%", "R 0") to visually distinguish from user-entered data.

### Feature Specifications
- **Dual View System**: Table and Hybrid views.
- **Search Functionality**: Memoized real-time fund search across multiple fields.
- **Real-time Updates**: Optimistic updates with TanStack Query.
- **Multi-Level Navigation**: Hierarchical navigation structure (Financial Plan > Needs > Steps > Calculators/Sections) with consolidated header bar.
- **Project Navigation**: Direct navigation to Project step without dropdown menus. Project button links directly to `/needs/death-estate-liquidity/project` for immediate access to graphs and projections.
- **Graph Tab Switcher**: Compact, content-sized tab navigation using gray background with white active tabs. Includes Overview, Estate Position, Dependants Position, Total Capital Position, and Income Position tabs for seamless graph navigation.
- **Multiple Owners/Beneficiaries**: Support for multiple owners and beneficiaries with CRUD operations and percentage splits.
- **Comprehensive Formatting**: System-wide consistent formatting for currency (R prefix, thousands separators), percentages (% suffix), and years.
- **Table Stability**: Implementation of patterns like `React.Fragment` with stable keys, debounced updates for text fields, immediate updates for array operations, and proper `rowSpan` usage to prevent jumping/flickering.

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: (Used during development for serverless PostgreSQL, but now standard PostgreSQL driver is used)
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

## Recent Major Updates

### August 6, 2025 - Global Entity Management System with Primary Entity Defaults
**Scope**: Complete transformation from text-based owner/beneficiary fields to dynamic entity management system with percentage validation and automatic Primary entity defaults across all major calculation tables

**Core Implementation**:
1. **Database Schema Updates**:
   - Added `ownershipPercentages` and `beneficiaryPercentages` arrays to assurance table
   - Synchronized array lengths to match owners/beneficiaries for data integrity
   - Default percentage values ensure proper functionality and prevent data corruption

2. **Reusable Global Components Created**:
   - `client/src/components/common/entity-owner-selector.tsx` - Universal owner selector with percentage validation
   - `client/src/components/common/entity-beneficiary-selector.tsx` - Universal beneficiary selector with percentage validation
   - Components validate that percentages total 100% for proper financial planning
   - Entity dropdowns populated from `/client-details` master registry

3. **Primary Entity Default System**:
   - **New Utility Functions**: `client/src/lib/entity-utils.ts` 
     - `getPrimaryEntity()` - Locates Primary entity from client details
     - `getDefaultOwners()` - Returns Primary entity as default owner
     - `getDefaultBeneficiaries()` - Returns Primary entity as default beneficiary
     - `getDefaultOwnershipPercentages()` - Returns 100% for single owner
     - `getDefaultBeneficiaryPercentages()` - Returns 100% for single beneficiary
   - **Global Rule**: All "Add Policy" and "Add Fund" buttons automatically pre-select "Garth Shoebridge (Primary entity)" with 100% allocations
   - **User Verified**: Primary entity defaults working perfectly across all tables

4. **UI Layout Resolution**:
   - **Issue Identified**: shadcn/ui Select component CSS specificity conflicts prevented proper action button positioning
   - **Solution Applied**: Replaced shadcn Select with native HTML select element in EntityBeneficiarySelector
   - **Result**: Action buttons now correctly appear before entity dropdowns as intended
   - Layout achieved: [+ Button] [Entity Dropdown] [Percentage %] with proper left-to-right ordering

5. **Global Pattern Established**:
   - Entity dropdowns replace text inputs for consistent entity selection
   - Percentage inputs with validation ensure 100% total distribution
   - Add/remove buttons maintain array synchronization automatically
   - Master entity registry from `/client-details` ensures data consistency
   - Validation messages display only once per fund to maintain stable table layout
   - Primary entity automatically selected for all new policies/funds

6. **Streamlined Table UI**:
   - Removed redundant "Percentage Split" columns since EntityBeneficiarySelector integrates both entity dropdown and percentage input
   - Updated table headers and colspan values for proper alignment
   - Cleaner, more efficient table layout across all calculation pages

**Tables Completed with Global Entity Pattern + Primary Defaults + Years/% Toggle Pattern**:
✓ `/assurance` - Working Assurance Table with EntityBeneficiarySelector and Primary entity defaults
✓ `/defined-benefit-funds` - Defined Benefit Funds Table with EntityOwnerSelector, Primary entity defaults, and Years/% toggle for Pension Income at Death
✓ `/new-retirement-funds` - Retirement Funds Table with EntityOwnerSelector/EntityBeneficiarySelector, Primary entity defaults, and Years/% toggle for Monthly Death Benefit

**Ready for Global Deployment**:
- `/assets` - Asset table with section grouping
- `/income-needs` - Income calculation tables
- `/income-provisions` - Provision calculation tables
- `/additional-estate-duty-items` - Estate duty calculation tables

### August 6, 2025 - Years/% Toggle Pattern Implementation for Defined Benefit Funds
**Scope**: Successfully implemented the reusable Years/% toggle pattern for Pension Income at Death section in Defined Benefit Funds table

**Implementation Details**:
1. **Database Schema**: Added `pensionIncomeCheckbox` (boolean) and `pensionIncomeYears` (text) fields to `defined_benefit_funds` table
2. **Toggle Functionality**: Button switches between Years mode (shows years input) and % mode (shows percentage input)
3. **Styling Consistency**: Applied established light blue toggle button styling (`bg-[#E8F3F8]` with `text-[#016991]`)
4. **Vertical Alignment**: Resolved alignment issues with proper `p-2` padding for both toggle and dynamic field columns
5. **Years Formatting**: Automatic "years" suffix formatting on blur (e.g., "10" becomes "10 years")
6. **Control Logic**: Toggle only enabled when pension income amount has a non-zero value
7. **Pattern Documentation**: Created comprehensive `YEARS_PERCENTAGE_TOGGLE_PATTERN.md` for future implementations

**Reusable Pattern Established**: The Years/% toggle pattern is now fully documented and ready for deployment to other calculation tables when needed (Income Needs, Income Provisions, Assets, etc.)

**Previous Updates**:
### August 6, 2025 - Comprehensive Calculation Page Refinements
- Complete SafeFragment implementation and React warning elimination across ALL calculation pages
- Table component updates with SafeFragment usage
- API functionality verification across all calculation pages
- Result: React Fragment warnings eliminated while preserving full functionality
```