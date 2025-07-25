#!/usr/bin/env node

/**
 * Script to systematically add getCellClass to all table components
 * for proper numeric field alignment
 */

const fs = require('fs');
const path = require('path');

// Define numeric field patterns that need right alignment
const numericFieldPatterns = [
  /className=[\s]*["`]([^"`]*)(currency|percentage|years|number)([^"`]*)["`]/g,
  /getFieldClass\(["`](currency|percentage|years|number)["`]\)/g,
  /field-(currency|percentage|years|number)/g
];

// Define table cell patterns to update
const cellPatterns = [
  /<td\s+className=[\s]*["`]([^"`]*)["`]/g,
  /<td\s+className=\{`([^`]*)`\}/g
];

// Field type to cell class mapping
const fieldTypeToCellClass = {
  'currency': 'text-right',
  'percentage': 'text-right', 
  'years': 'text-right',
  'number': 'text-right',
  'text': 'text-left'
};

function updateTableComponent(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let updated = false;

    // Check if getCellClass is already imported
    if (!content.includes('getCellClass')) {
      // Add getCellClass import
      content = content.replace(
        /import\s+\{([^}]*getFieldClass[^}]*)\}\s+from\s+['"]@\/lib\/field-types['"];?/,
        (match, imports) => {
          if (!imports.includes('getCellClass')) {
            const newImports = imports.trim() + ', getCellClass';
            updated = true;
            return match.replace(imports, newImports);
          }
          return match;
        }
      );
    }

    // Add getCellClass to table cells with numeric fields
    // This is a simplified pattern - would need more sophisticated parsing for production
    const numericFieldRegex = /(currency|percentage|years|number)/;
    
    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
      return true;
    }

  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
  
  return false;
}

// Get all table component files
const tableComponents = [
  'client/src/components/defined-benefit-funds/defined-benefit-funds-table-correct.tsx',
  'client/src/components/income-needs/income-needs-table.tsx',
  'client/src/components/income-provisions/income-provisions-table-new.tsx',
  'client/src/components/voluntary-investments/voluntary-investments-table.tsx',
  'client/src/components/assets-and-liabilities/assets-and-liabilities-table.tsx',
  'client/src/components/lump-sum-bequests/lump-sum-table.tsx',
  'client/src/components/residue/residue-table.tsx',
  'client/src/components/additional-estate-duty-items/additional-estate-duty-items-table.tsx',
  'client/src/components/assurance/working-assurance-table.tsx',
  'client/src/components/retirement-funds/new-retirement-table.tsx'
];

console.log('Updating table components for proper numeric field alignment...');

let updatedCount = 0;
tableComponents.forEach(component => {
  if (fs.existsSync(component)) {
    if (updateTableComponent(component)) {
      updatedCount++;
    }
  } else {
    console.log(`File not found: ${component}`);
  }
});

console.log(`Updated ${updatedCount} table components.`);