# Elite Wealth Design System Specification

**Version:** 1.0.0  
**Last Updated:** February 2026  

A comprehensive design system specification for building Elite Wealth-branded financial planning interfaces. This document provides all visual patterns, component styles, color codes, and implementation guidelines needed to create consistent, professional financial applications.

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Button System](#button-system)
6. [Form & Input Patterns](#form--input-patterns)
7. [Table Patterns](#table-patterns)
8. [Hybrid View System](#hybrid-view-system)
9. [Navigation Patterns](#navigation-patterns)
10. [Dialog & Modal Patterns](#dialog--modal-patterns)
11. [Data Visualization](#data-visualization)
12. [Loading & Feedback States](#loading--feedback-states)
13. [Component Reference](#component-reference)
14. [CSS Class Reference](#css-class-reference)

---

## Brand Foundation

### Brand Identity

Elite Wealth uses a professional, trust-inspiring color palette centered on blue and orange accents. The design language emphasizes clarity, precision, and financial credibility.

### Design Principles

1. **Clarity** - Financial data must be immediately readable and unambiguous
2. **Precision** - Numerical data uses consistent formatting and alignment
3. **Trust** - Professional color palette inspires confidence
4. **Efficiency** - Interfaces minimize cognitive load for complex data entry
5. **Consistency** - All components follow established patterns

---

## Color System

### Primary Brand Colors

| Color Name | Hex Code | RGB | HSL | Usage |
|------------|----------|-----|-----|-------|
| **Elite Wealth Blue** | `#016991` | rgb(1, 105, 145) | hsl(196, 99%, 29%) | Primary actions, headers, links |
| **Elite Wealth Blue Dark** | `#014a66` | rgb(1, 74, 102) | hsl(196, 99%, 20%) | Hover states, emphasis |
| **Elite Wealth Blue Darkest** | `#013849` | rgb(1, 56, 73) | hsl(196, 97%, 15%) | Active/pressed states |
| **Elite Wealth Orange** | `#F97415` | rgb(249, 116, 21) | hsl(25, 95%, 53%) | Accents, CTAs, active navigation |

### Need-Type Colors

Used to distinguish different financial need categories:

| Need Type | Hex Code | Usage |
|-----------|----------|-------|
| **Death/Estate** | `#539cc7` | Death with estate liquidity, estate planning |
| **Retirement** | `#f1b431` | Retirement income needs |
| **Disability** | `#8d7b9f` | Disability income coverage |

### Chart & Visualization Colors

#### Primary Chart Colors
| Name | CSS Variable | Hex Code | Usage |
|------|--------------|----------|-------|
| Blue | `--chart-primary-blue` | `#2196F3` | Provided/covered amounts |
| Orange | `--chart-primary-orange` | `#FF9800` | Required amounts |
| Green | `--chart-primary-green` | `#4CAF50` | Surplus/positive values |
| Pink | `--chart-primary-pink` | `#E91E63` | Deficit/negative values |

#### Secondary Chart Colors
| Name | CSS Variable | Hex Code | Usage |
|------|--------------|----------|-------|
| Teal Dark | `--chart-secondary-teal-dark` | `#0F7377` | Dark accent data |
| Teal | `--chart-secondary-teal` | `#5DADE2` | Secondary data series |
| Brown | `--chart-secondary-brown` | `#8D6E63` | Tertiary data |
| Purple | `--chart-secondary-purple` | `#9C27B0` | Additional categories |
| Blue Dark | `--chart-secondary-blue-dark` | `#3F51B5` | Deep blue accents |
| Light Blue | `--chart-secondary-blue-light` | `#BBDEFB` | Background fills, gauges |
| Light Green | `--chart-secondary-green-light` | `#A8E6CF` | Positive indicators |

### UI Colors

#### Backgrounds
| Usage | Hex Code | CSS Variable / Class |
|-------|----------|----------------------|
| Page Background | `#EFF2F5` | `var(--background)` |
| Card Background | `#ffffff` | `bg-white` |
| Table Header | `#f9fafb` | `bg-gray-50` |
| Total Row | `#f3f4f6` | `bg-gray-100` |
| Sidebar | `#fafafa` | `bg-neutral-50` |
| Light Blue Accent | `#E8F3F8` | Custom |

#### Borders
| Usage | Hex Code | Class |
|-------|----------|-------|
| Default | `#e5e7eb` | `border-gray-200` |
| Subtle | `#f3f4f6` | `border-gray-100` |
| Section Divider | `#d1d5db` | `border-gray-300` |
| Strong | `#9ca3af` | `border-gray-400` |

#### Text Colors
| Usage | Hex Code | Class |
|-------|----------|-------|
| Primary Text | `#111827` | `text-gray-900` |
| Secondary Text | `#374151` | `text-gray-700` |
| Muted Text | `#6b7280` | `text-gray-500` |
| Disabled/Placeholder | `#9ca3af` | `text-gray-400` |
| Labels | `#4b5563` | `text-gray-600` |

#### Status Colors
| Status | Hex Code | Usage |
|--------|----------|-------|
| Success | `#10b981` | Positive confirmations |
| Warning | `#f59e0b` | Caution indicators |
| Error/Destructive | `#ef4444` | Errors, delete actions |
| Info | `#3b82f6` | Informational messages |

---

## Typography

### Font Family

```css
font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

### Font Size Scale

| Name | Size | Line Height | Usage |
|------|------|-------------|-------|
| `text-xs` | 12px | 1rem | Table headers, small labels |
| `text-sm` | 14px | 1.25rem | Body text, inputs, buttons |
| `text-base` | 16px | 1.5rem | Standard content |
| `text-lg` | 18px | 1.75rem | Section titles |
| `text-xl` | 20px | 1.75rem | Card titles |
| `text-2xl` | 24px | 2rem | Page headings |

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | 400 | Body text, inputs |
| Medium | 500 | Buttons, emphasized text |
| Semibold | 600 | Section headers |
| Bold | 700 | Totals, strong emphasis |

### Table Typography Standards

```css
/* Table headers - 12px uppercase */
.table-header-12 {
  font-size: 0.75rem; /* 12px */
  text-transform: uppercase;
  letter-spacing: 0.025em;
  color: #6b7280; /* gray-500 */
  font-weight: 500;
}

/* Table body text - 14px */
.table-text-14 {
  font-size: 0.875rem; /* 14px */
  color: #374151; /* gray-700 */
}
```

### Label Formatting

- **Form Labels**: `text-sm font-medium text-gray-700`
- **Table Headers**: `text-xs uppercase tracking-wide text-gray-500 font-medium`
- **Section Headers**: `text-sm font-semibold uppercase tracking-wider text-gray-600`
- **Field Group Titles**: `text-sm font-medium text-neutral-700 uppercase tracking-wide`

---

## Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Component internal spacing |
| `space-3` | 12px | Related elements |
| `space-4` | 16px | Standard gap |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Major sections |

### Container Widths

| Container | Width | Usage |
|-----------|-------|-------|
| Navigation Content | `1320px` | Main navigation bar content |
| Max Content | `1280px` | Page content maximum |
| Sidebar | `320px` (w-80) | Hybrid view sidebar |
| Dialog Small | `425px` | Simple dialogs |
| Dialog Medium | `600px` | Standard forms |
| Dialog Large | `800px` | Complex forms |

### Layout Patterns

#### Page Container
```html
<div class="w-full px-6 py-6">
  <div class="w-[1320px]">
    <!-- Content -->
  </div>
</div>
```

#### Card Container
```html
<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
  <!-- Content -->
</div>
```

#### Grid System
```css
/* Responsive grid for summary cards */
grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
gap: 1rem;
```

---

## Button System

### Button Variants

Button heights vary by size class. See Button Sizes section below for details. Action buttons in navigation and special contexts use fixed 40px height.

#### Primary Button (`.btn-primary`)
```css
.btn-primary {
  background-color: #016991;
  color: white;
  border: 1px solid #016991;
  font-weight: 500;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-primary:hover { background-color: #014a66; }
```
**Usage**: Save, Submit, Create actions

#### Secondary Button (`.btn-secondary`)
```css
.btn-secondary {
  background-color: white;
  color: #828282;
  border: 1px solid #BDBDBD;
  font-weight: 400;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-secondary:hover {
  background-color: #F2F2F2;
  color: #4F4F4F;
}
```
**Usage**: Cancel, Back, View Details

#### Destructive Button (`.btn-destructive`)
```css
.btn-destructive {
  background-color: #ef4444;
  color: white;
  border: 1px solid #ef4444;
  font-weight: 500;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-destructive:hover { background-color: #dc2626; }
```
**Usage**: Delete, Remove, Reset

#### Ghost Button (`.btn-ghost`)
```css
.btn-ghost {
  background-color: transparent;
  color: #6b7280;
  border: none;
  font-weight: 400;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-ghost:hover {
  background-color: #f3f4f6;
  color: #374151;
}
```
**Usage**: Less important actions, icon buttons

#### Need/Orange Button (`.btn-need`)
```css
.btn-need {
  background-color: #F97415;
  color: white;
  border: 1px solid #F97415;
  font-weight: 500;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-need:hover { opacity: 0.9; }
```
**Usage**: Active navigation states, need dropdown

### Icon Buttons

#### Icon Button Blue (`.btn-icon-blue`)
```css
.btn-icon-blue {
  background-color: #E8F3F8;
  color: #016991;
  border: 1px solid #E8F3F8;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-icon-blue:hover { background-color: #D1E7F0; }
```
**Usage**: Add actions in tables

#### Icon Button White (`.btn-icon-white`)
```css
.btn-icon-white {
  background-color: white;
  color: #4F4F4F;
  border: 1px solid #E0E0E0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
}
.btn-icon-white:hover { background-color: #F8F8F8; }
```
**Usage**: Delete, duplicate actions

### Table Header Add Button

```css
.table-header-add-button {
  width: 24px;
  height: 24px;
  background-color: #016991;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
}
.table-header-add-button:hover { background-color: #014a66; }
```

### Button Sizes

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| Small (`.btn-sm`) | 32px | 0 0.75rem | 14px |
| Medium (`.btn-md`) | 36px | 0 1rem | 14px |
| Large (`.btn-lg`) | 40px | 0 1.5rem | 16px |

### Icon Button Sizes

| Size | Dimensions | Usage |
|------|------------|-------|
| Small (`.btn-icon-sm`) | 24×24px | Compact table actions |
| Medium (`.btn-icon-md`) | 32×32px | Standard table actions |
| Large (`.btn-icon-lg`) | 40×40px | Prominent actions |

**Note**: Navigation buttons (`.nav-button`, `.btn-need`) and special action buttons in index.css use a fixed 40px height for consistency in navigation contexts.

---

## Form & Input Patterns

### Text Input

```css
.table-input {
  width: 100%;
  padding: 0.375rem 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.table-input:hover {
  background-color: #f9fafb;
  border-color: rgba(1, 105, 145, 0.3);
}
.table-input:focus {
  background-color: white;
  border-color: #016991;
  box-shadow: 0 0 0 2px rgba(1, 105, 145, 0.2);
  outline: none;
}
```

### Field Type-Specific Widths

| Field Type | Min Width | Max Width | Width | Alignment |
|------------|-----------|-----------|-------|-----------|
| Text | 150px | 300px | auto | left |
| Currency | 100px | 140px | 120px | right |
| Percentage | 50px | 65px | 65px | right |
| Years | 80px | 80px | 80px | right |
| Number | 70px | 120px | auto | right |

### Field Type CSS Classes

```css
.field-text { min-width: 150px; max-width: 300px; text-align: left; }
.field-currency { min-width: 100px; max-width: 140px; width: 120px; text-align: right; }
.field-percentage { min-width: 50px; max-width: 65px; width: 65px; text-align: right; }
.field-years { min-width: 80px; max-width: 80px; width: 80px; text-align: right; }
.field-number { min-width: 70px; max-width: 120px; text-align: right; }
```

### Default Value Styling

```css
.default-value {
  color: #9ca3af; /* gray-400 - indicates placeholder/default */
}
.default-value:focus {
  color: #374151; /* gray-700 - darker when focused */
}
.entered-value {
  color: #374151; /* gray-700 - user-entered values */
}
```

### Calculated/Read-Only Fields

```css
.calculated-field {
  background-color: transparent;
  border: 1px solid transparent;
  cursor: default;
  user-select: none;
  color: #374151;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  text-align: right;
}
```

### Data Formatting Standards

#### Currency Format
```javascript
// Format: R X,XXX (South African Rand)
const formatCurrency = (value) => {
  const numValue = parseFloat(value) || 0;
  return `R ${numValue.toLocaleString()}`;
};
```

#### Percentage Format
```javascript
// Format: XX% or XX.X%
const formatPercentage = (value) => {
  const numValue = parseFloat(value) || 0;
  return `${numValue}%`;
};
```

#### Years Format
```javascript
// Format: X years
const formatYears = (value) => {
  const numValue = parseFloat(value) || 0;
  return `${numValue} years`;
};
```

---

## Table Patterns

### Basic Table Structure

```html
<table class="w-full border-collapse bg-white">
  <thead>
    <tr class="bg-gray-50">
      <th class="table-header-12 px-3 py-2 text-left">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr class="border-b border-gray-200 hover:bg-gray-50">
      <td class="table-text-14 px-3 py-2">Data</td>
    </tr>
  </tbody>
</table>
```

### Table Cell Padding

```css
table th, table td {
  padding-left: 0.375rem;
  padding-right: 0.375rem;
}
```

### Row Borders

```css
tbody tr td {
  border-bottom: 1px solid #e5e7eb;
}
```

### Section Borders

```css
/* Vertical section dividers */
.section-start {
  border-left: 1px solid #d1d5db;
  padding-left: 6px;
  padding-right: 6px;
}
.section-end {
  border-right: 2px solid #9ca3af;
}
```

### Total Row

```css
.table-total-row {
  height: 2rem;
  font-weight: 700;
}
.bg-gray-100 .table-text-14,
.bg-gray-100 td {
  font-weight: 700;
}
```

### Policy/Item Separation

```css
.policy-first-row {
  border-top: 2px solid #d1d5db;
}
.policy-first-row:first-child {
  border-top: none;
}
.policy-last-row td {
  padding-bottom: 20px;
}
```

### Double-Row Headers

For complex tables with category headers:

```html
<thead>
  <!-- First row: Section headers spanning columns -->
  <tr class="bg-gray-50">
    <th rowSpan="2">Actions</th>
    <th colSpan="3" class="section-start">Overview</th>
    <th colSpan="4" class="section-start">Details</th>
  </tr>
  <!-- Second row: Column headers -->
  <tr class="bg-gray-50">
    <th class="section-start">Description</th>
    <th>Owner</th>
    <th>Amount</th>
    <!-- etc -->
  </tr>
</thead>
```

---

## Hybrid View System

The Hybrid View provides a split-pane interface with preview cards on the left and detail forms on the right.

### Layout Structure

```html
<div class="flex border-t border-neutral-200">
  <!-- Left Sidebar - Preview Cards -->
  <div class="w-80 flex-shrink-0 border-r border-neutral-200 bg-neutral-50">
    <div class="hybrid-add-button-container p-4 border-b border-neutral-200">
      <!-- Add button -->
    </div>
    <div class="hybrid-tabs-list">
      <!-- Preview cards list -->
    </div>
  </div>
  
  <!-- Right Panel - Detail Form -->
  <div class="flex-1 p-6 bg-white overflow-y-auto">
    <!-- Detail form content -->
  </div>
</div>
```

### Preview Card Structure

```html
<div class="px-4 py-3 cursor-pointer transition-colors border-b border-neutral-200
            hover:bg-neutral-100
            [active state: bg-white border-l-4 border-l-primary]">
  <div class="flex items-start justify-between">
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-medium text-gray-900 truncate">{title}</h4>
      <p class="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
    <div class="text-right ml-2">
      <span class="text-sm font-medium text-gray-900">{primaryValue}</span>
      <p class="text-xs text-gray-500">{secondaryInfo}</p>
    </div>
  </div>
</div>
```

### Preview Card Active State

```css
/* Active card styling */
.preview-card-active {
  background-color: white;
  border-left: 4px solid #016991;
  padding-left: calc(1rem - 4px);
}
```

### Detail Form Layout

```html
<div class="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
  <!-- Header with actions -->
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-medium text-gray-900">{title}</h3>
    <div class="flex items-start gap-2">
      <!-- Action buttons: Duplicate, Delete -->
    </div>
  </div>
  
  <!-- Field groups -->
  <div class="space-y-6">
    <!-- FieldGroup components -->
  </div>
</div>
```

### Field Group Structure

```html
<div class="space-y-3">
  <h3 class="text-sm font-medium text-neutral-700 uppercase tracking-wide 
             border-b border-neutral-200 pb-1">
    {groupTitle}
  </h3>
  <div class="space-y-4">
    <!-- FormField components -->
  </div>
</div>
```

### Form Field Layout

```html
<div class="grid grid-cols-3 items-center gap-x-3">
  <label class="text-sm text-gray-600">{label}</label>
  <div class="col-span-2">
    <!-- Input component -->
  </div>
</div>
```

### Standard Field Groupings

1. **Overview** - Description, policy name, basic identifiers
2. **Main Details** - Primary values, amounts, dates
3. **Additional/Specialized** - Domain-specific fields
4. **Beneficiaries** - Owner/beneficiary management

---

## Navigation Patterns

### Consolidated Navigation Header

```html
<div class="w-full px-6 pt-8 pb-2">
  <div class="w-[1320px] bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Left: Plan name and Need dropdown -->
      <div class="flex items-center gap-4">
        <span class="text-lg font-medium text-gray-900">{planName}</span>
        <button class="btn-need px-4 flex items-center gap-2 text-sm h-10">
          {currentNeed}
          <ChevronDown />
        </button>
      </div>
      
      <!-- Right: Step navigation -->
      <div class="flex items-center gap-2">
        {steps.map(step => (
          <button class="nav-button [active: nav-button active]">
            {step.label}
          </button>
        ))}
      </div>
    </div>
  </div>
</div>
```

### Navigation Button States

```css
.nav-button {
  background-color: white;
  color: #4F4F4F;
  border: 1px solid #E0E0E0;
  font-weight: 400;
  height: 2.5rem;
  transition: all 0.15s ease-in-out;
}
.nav-button:hover {
  background-color: #F2F2F2;
  border-color: #BDBDBD;
}
.nav-button.active {
  background-color: #F97415;
  color: white;
  border-color: #F97415;
  font-weight: 500;
}
```

### Dropdown Menu Styling

```css
.dropdown-menu-content {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 4px;
  min-width: 200px;
}
.dropdown-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
  border-radius: 4px;
}
.dropdown-menu-item:hover {
  background-color: #f3f4f6;
  color: #111827;
}
```

### View Mode Switcher

```html
<div class="view-mode-switcher inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
  <button data-state="active" class="px-3 py-1.5 text-sm rounded-md
    [active: bg-white text-gray-900 font-medium shadow-sm]
    [inactive: text-gray-500 hover:bg-gray-100]">
    Table
  </button>
  <button data-state="inactive">
    Hybrid
  </button>
</div>
```

---

## Dialog & Modal Patterns

### Dialog Structure

```html
<div class="fixed inset-0 z-50 bg-black/60">
  <div class="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
              w-full max-w-lg bg-white rounded-lg shadow-lg border p-6">
    
    <!-- Header -->
    <div class="flex flex-col space-y-1.5 text-center sm:text-left">
      <h2 class="text-lg font-semibold text-gray-900">{title}</h2>
      <p class="text-sm text-gray-500">{description}</p>
    </div>
    
    <!-- Content -->
    <div class="py-4">
      <!-- Form fields or content -->
    </div>
    
    <!-- Footer -->
    <div class="flex justify-end gap-2">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-primary">Confirm</button>
    </div>
    
    <!-- Close button -->
    <button class="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100">
      <X class="h-4 w-4" />
    </button>
  </div>
</div>
```

### Alert Dialog (Confirmation)

```html
<div class="fixed inset-0 z-50 bg-black/80">
  <div class="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]
              max-w-md bg-white rounded-lg p-6">
    <h2 class="text-lg font-semibold">Are you sure?</h2>
    <p class="text-sm text-gray-500 mt-2">{message}</p>
    <div class="flex justify-end gap-2 mt-4">
      <button class="btn-secondary">Cancel</button>
      <button class="btn-destructive">Delete</button>
    </div>
  </div>
</div>
```

### Dialog Form Layout

```html
<div class="space-y-4">
  <div class="space-y-2">
    <label class="text-sm font-medium text-gray-700">{label}</label>
    <input class="table-input w-full" />
  </div>
  <!-- Additional fields -->
</div>
```

---

## Data Visualization

### Bar Chart

Pure CSS implementation for guaranteed rendering:

```html
<div class="flex items-end justify-center gap-8 h-[220px] pt-4">
  <!-- Bar container -->
  <div class="flex flex-col items-center gap-2">
    <span class="text-sm font-medium text-gray-600">{formattedValue}</span>
    <div class="w-16 rounded-t transition-all duration-300"
         style="height: {scaledHeight}px; background-color: var(--chart-primary-blue);">
    </div>
    <span class="text-xs text-gray-500">Provided</span>
  </div>
  <!-- Repeat for Required, Surplus -->
</div>
```

### Gauge Chart

Semi-circular gauge using Recharts PieChart:

```javascript
const chartData = [
  { name: 'Covered', value: percentage, fill: 'var(--chart-primary-blue)' },
  { name: 'Remaining', value: 200 - percentage, fill: 'var(--chart-secondary-blue-light)' }
];

// Render as 180-degree arc
<PieChart>
  <Pie
    data={chartData}
    startAngle={180}
    endAngle={0}
    innerRadius="70%"
    outerRadius="100%"
    dataKey="value"
  />
</PieChart>
```

### Summary Card (Value Display)

```html
<div class="p-4 rounded-lg bg-gray-50 border border-gray-200">
  <span class="text-sm text-gray-500 block">{label}</span>
  <span class="text-2xl font-bold text-gray-900 block mt-1">{value}</span>
</div>
```

### Chart Color Variables (CSS)

```css
:root {
  /* Primary chart colors */
  --chart-primary-blue: #2196F3;
  --chart-primary-orange: #FF9800;
  --chart-primary-green: #4CAF50;
  --chart-primary-pink: #E91E63;
  
  /* Secondary chart colors */
  --chart-secondary-teal-dark: #0F7377;
  --chart-secondary-teal: #5DADE2;
  --chart-secondary-brown: #8D6E63;
  --chart-secondary-purple: #9C27B0;
  --chart-secondary-blue-dark: #3F51B5;
  --chart-secondary-blue-light: #BBDEFB;
  --chart-secondary-green-light: #A8E6CF;
}
```

---

## Loading & Feedback States

### Global Loading Bar

```html
<div class="fixed top-0 left-0 right-0 h-1 z-[100]"
     style="background: linear-gradient(90deg, #016991 0%, #0284c7 50%, #016991 100%);
            width: {progress}%;">
</div>
```

### Loading Animation

```css
@keyframes loading-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.loading-bar {
  animation: loading-pulse 1.5s ease-in-out infinite;
}
```

### Save Flash Animation

```css
@keyframes save-flash {
  0% { background-color: hsl(120, 60%, 95%); }
  100% { background-color: transparent; }
}
.save-flash {
  animation: save-flash 500ms ease-out;
}
```

### Disabled State

```css
:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

### Skeleton Loading

```html
<div class="animate-pulse">
  <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

---

## Component Reference

### Action Buttons

| Component | Size | Background | Icon Color | Usage |
|-----------|------|------------|------------|-------|
| AddButton (sm) | 32×32px | #E8F3F8 | #016991 | Add row in table |
| AddButton (lg) | 40×40px | #016991 | white | Add new item |
| DeleteButton (sm) | 32×32px | white | gray-600 | Delete row |
| DeleteButton (lg) | 40px height | #ef4444 | white | Delete item |
| DuplicateButton | 32×32px | white | gray-600 | Duplicate item |

### Entity Selectors

Components for managing owners and beneficiaries with:
- Dropdown selection from entity list
- Percentage input (0-100%)
- Add/Remove controls
- Renders own `<td>` elements (never wrap in additional `<td>`)

### View Mode Switcher

Toggle between Table and Hybrid views:
- Persists preference to `localStorage`
- Uses `.view-mode-switcher` styling
- Active state: white background with shadow

---

## CSS Class Reference

### Button Classes
- `.btn-primary` - Primary blue action button
- `.btn-secondary` - White secondary button
- `.btn-destructive` - Red destructive button
- `.btn-ghost` - Transparent minimal button
- `.btn-need` - Orange need dropdown button
- `.btn-icon-blue` - Light blue icon button
- `.btn-icon-white` - White icon button
- `.nav-button` - Navigation step button
- `.table-header-add-button` - Small add button for table headers

### Input Classes
- `.table-input` - Base input styling
- `.field-text` - Text field sizing
- `.field-currency` - Currency field sizing
- `.field-percentage` - Percentage field sizing
- `.field-years` - Years field sizing
- `.field-number` - Number field sizing
- `.calculated-field` - Read-only calculated values
- `.default-value` - Gray placeholder styling
- `.entered-value` - Normal text color

### Table Classes
- `.table-header-12` - 12px uppercase header
- `.table-text-14` - 14px body text
- `.table-total-row` - Bold total row styling
- `.section-start` - Left border section divider
- `.section-end` - Right border section divider
- `.policy-first-row` - Top border for new items
- `.policy-last-row` - Bottom padding for items

### Layout Classes
- `.hybrid-add-button-container` - Add button container in sidebar
- `.hybrid-tabs-list` - Preview card container
- `.dropdown-menu-content` - Dropdown container
- `.dropdown-menu-item` - Dropdown item
- `.view-mode-switcher` - Table/Hybrid toggle

### Animation Classes
- `.save-flash` - Green flash on save
- `.loading-pulse` - Loading bar pulse

---

## Implementation Notes

### SelectItem Validation

**CRITICAL**: Always filter empty strings from SelectItem arrays to prevent React errors:

```javascript
const validItems = items.filter(item => item && item.trim() !== '');
```

### Input Field Pattern

Use uncontrolled inputs with `defaultValue` and `onBlur` for performance:

```jsx
<input
  type="text"
  defaultValue={value}
  onBlur={(e) => onUpdate(field, e.target.value)}
  className="table-input field-currency"
/>
```

### Hybrid View Border Management

Use `isFirst` and `isLast` props to control border rendering on preview cards:

```jsx
<PreviewCard
  isFirst={index === 0}
  isLast={index === items.length - 1}
/>
```

### View Mode Persistence

Store view preference in localStorage:

```javascript
const [viewMode, setViewMode] = useState(() => 
  localStorage.getItem('viewMode') || 'table'
);
useEffect(() => {
  localStorage.setItem('viewMode', viewMode);
}, [viewMode]);
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 2026 | Initial specification release |

---

*This specification is maintained as part of the Elite Wealth Design System. For questions or updates, refer to the component source files and style guides in the codebase.*
