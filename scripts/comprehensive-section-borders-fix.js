#!/usr/bin/env node

import fs from 'fs';

// All table components that need comprehensive section border fixes
const tableComponents = [
  'client/src/components/voluntary-investments/voluntary-investments-table.tsx',
  'client/src/components/defined-benefit-funds/defined-benefit-funds-table.tsx',
  'client/src/components/assets/assets-table.tsx',
  'client/src/components/liabilities/liabilities-table.tsx',
  'client/src/components/lump-sum-bequests/lump-sum-table.tsx',
  'client/src/components/residue/residue-table.tsx',
  'client/src/components/additional-estate-duty-items/additional-estate-duty-items-table.tsx',
];

function applySectionBorderFixes(content) {
  let updated = content;
  
  // 1. Remove ALL conflicting border classes from tr elements and th/td elements
  updated = updated.replace(
    /className="([^"]*?)(?:border-b|border-neutral-200|border-border|border-bottom|border-t|border-top)([^"]*?)"/g,
    'className="$1$2"'
  );
  
  // 2. Clean up extra spaces in className attributes
  updated = updated.replace(/className="([^"]*?)\s+"/g, 'className="$1"');
  updated = updated.replace(/className="\s+([^"]*?)"/g, 'className="$1"');
  updated = updated.replace(/className="([^"]*?)\s+([^"]*?)"/g, 'className="$1 $2"');
  
  // 3. Remove any remaining border-related classes
  updated = updated.replace(/\s+border-[a-z-]+\s+/g, ' ');
  updated = updated.replace(/\s+border-[a-z-]+"/g, '"');
  updated = updated.replace(/"\s+border-[a-z-]+/g, '"');
  
  // 4. Clean up multiple spaces
  updated = updated.replace(/\s+/g, ' ');
  updated = updated.replace(/className="(\s*)/g, 'className="');
  updated = updated.replace(/(\s*)"/g, '"');
  
  return updated;
}

console.log('🔧 Applying comprehensive section border fixes globally...\n');

let updatedCount = 0;
tableComponents.forEach(component => {
  if (!fs.existsSync(component)) {
    console.log(`❌ File not found: ${component}`);
    return;
  }
  
  try {
    const content = fs.readFileSync(component, 'utf8');
    const updatedContent = applySectionBorderFixes(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(component, updatedContent);
      console.log(`✅ Fixed: ${component}`);
      updatedCount++;
    } else {
      console.log(`✓ No changes needed: ${component}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${component}:`, error.message);
  }
});

console.log(`\n🎉 Completed: Applied comprehensive fixes to ${updatedCount} table components.`);
console.log('📝 All conflicting border classes removed - global CSS will handle section borders.');