// Design system tokens for consistent styling across the application
import { defaultFieldTypes, type FieldTypeConfig } from './field-types';

export const designTokens = {
  // Brand Colors
  colors: {
    primary: {
      50: 'hsl(198, 50%, 96%)',
      100: 'hsl(198, 60%, 90%)', 
      200: 'hsl(198, 70%, 75%)',
      300: 'hsl(198, 80%, 55%)',
      400: 'hsl(198, 90%, 45%)',
      500: 'hsl(198, 95%, 35%)',
      600: 'hsl(198, 99%, 29%)', // Primary brand color
      700: 'hsl(198, 99%, 25%)',
      800: 'hsl(198, 95%, 20%)',
      900: 'hsl(198, 90%, 14%)',
    },
    secondary: {
      50: 'hsl(48, 55%, 97%)',
      100: 'hsl(48, 67%, 94%)',
      200: 'hsl(47, 75%, 89%)',
      300: 'hsl(44, 80%, 83%)',
      400: 'hsl(42, 87%, 75%)',
      500: 'hsl(38, 92%, 67%)',
      600: 'hsl(31, 91%, 60%)',
      700: 'hsl(25, 95%, 53%)', // Secondary brand color
      800: 'hsl(20, 91%, 48%)',
      900: 'hsl(15, 86%, 30%)',
    },
    neutral: {
      50: 'hsl(210, 20%, 98%)',
      100: 'hsl(220, 14%, 96%)',
      200: 'hsl(220, 13%, 91%)',
      300: 'hsl(216, 12%, 84%)',
      400: 'hsl(218, 11%, 65%)',
      500: 'hsl(220, 9%, 46%)',
      600: 'hsl(215, 14%, 34%)',
      700: 'hsl(217, 19%, 27%)',
      800: 'hsl(215, 28%, 17%)',
      900: 'hsl(220, 13%, 18%)',
    }
  },

  // Component-specific styles
  components: {
    table: {
      // Standard table styling
      cell: "table-cell border-r border-neutral-200 dark:border-neutral-600 last:border-r-0",
      headerCell: "table-header-12 font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-50 dark:bg-neutral-700",
      bodyCell: "table-text-14 text-neutral-900 dark:text-neutral-100",
      row: "table-row hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors",
      totalRow: "table-total-row bg-neutral-100 dark:bg-neutral-600 font-bold",
      wrapper: "w-full border-collapse bg-white dark:bg-neutral-800 shadow-sm rounded-lg overflow-hidden",
      input: "table-input",
    },
    
    tabs: {
      // Tab navigation styling
      container: "mb-6",
      nav: "border-b border-neutral-200 dark:border-neutral-700",
      navList: "flex flex-wrap gap-x-6 gap-y-2",
      tab: "py-4 px-1 border-b-2 font-medium text-sm transition-colors",
      tabActive: "border-primary text-primary dark:border-primary dark:text-primary",
      tabInactive: "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300",
    },

    buttons: {
      // Button variants
      primary: "bg-primary hover:bg-primary/90 text-primary-foreground",
      secondary: "bg-secondary hover:bg-secondary/90 text-secondary-foreground", 
      destructive: "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },

    form: {
      // Form input styling
      input: "table-input focus:ring-2 focus:ring-primary focus:border-transparent",
      select: "table-input text-left focus:ring-2 focus:ring-primary focus:border-transparent",
      label: "text-sm font-medium text-neutral-700 dark:text-neutral-300",
    }
  },

  // Layout tokens
  layout: {
    container: "max-w-7xl mx-auto px-4 py-8",
    section: "space-y-4",
    cardPadding: "p-6",
    borderRadius: "rounded-lg",
  },

  // Animation tokens
  animations: {
    transition: "transition-colors duration-200",
    fadeIn: "section-enter",
    slideIn: "animate-in slide-in-from-bottom-2 duration-300",
  },

  // Field type system integration
  fieldTypes: defaultFieldTypes
} as const;

// Utility functions for consistent styling
export const getTableCellClass = (isHeader = false, isTotal = false) => {
  let classes = designTokens.components.table.cell;
  
  if (isHeader) {
    classes += ` ${designTokens.components.table.headerCell}`;
  } else if (isTotal) {
    classes += ` ${designTokens.components.table.bodyCell} font-bold`;
  } else {
    classes += ` ${designTokens.components.table.bodyCell}`;
  }
  
  return classes;
};

export const getTabClass = (isActive = false) => {
  return `${designTokens.components.tabs.tab} ${
    isActive 
      ? designTokens.components.tabs.tabActive 
      : designTokens.components.tabs.tabInactive
  }`;
};

export const getButtonClass = (variant: keyof typeof designTokens.components.buttons = 'primary') => {
  return `inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${designTokens.components.buttons[variant]}`;
};

// Field type utility functions for consistent table behavior
export const getFieldClass = (fieldName: string, additionalClasses = '') => {
  const config = designTokens.fieldTypes[fieldName] || designTokens.fieldTypes.text;
  return `${config.inputProps?.className || 'table-input'} ${additionalClasses}`.trim();
};

export const getFieldWidth = (fieldName: string) => {
  const config = designTokens.fieldTypes[fieldName] || designTokens.fieldTypes.text;
  return {
    minWidth: config.inputProps?.minWidth || '80px',
    maxWidth: config.inputProps?.maxWidth || '200px'
  };
};

export const getFieldDefaultValue = (fieldName: string) => {
  const config = designTokens.fieldTypes[fieldName] || designTokens.fieldTypes.text;
  return config.defaultValue;
};

// Table column width standards for consistent layouts
export const tableColumnWidths = {
  description: '200px',
  name: '150px',
  owner: '150px',
  beneficiary: '150px',
  amount: '120px',
  currency: '120px',
  percentage: '80px',
  years: '90px',
  checkbox: '60px',
  actions: '100px',
  additionalInfo: '200px'
} as const;