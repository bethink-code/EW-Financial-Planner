#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// All table components that need section border fixes
const tableComponents = [
  'client/src/components/income-provisions/income-provisions-table.tsx',
  'client/src/components/defined-benefit-funds/defined-benefit-funds-table.tsx',
  'client/src/components/voluntary-investments/voluntary-investments-table.tsx',
  'client/src/components/assets/assets-table.tsx',
  'client/src/components/liabilities/liabilities-table.tsx',
  'client/src/components/lump-sum-bequests/lump-sum-table.tsx',
  'client/src/components/residue/residue-table.tsx',
  'client/src/components/additional-estate-duty-items/additional-estate-duty-items-table.tsx',
  'client/src/components/assurance/assurance-table.tsx',
  'client/src/components/retirement-funds/simple-table-with-beneficiaries.tsx',
];

function fixSectionBorders(content) {
  let updated = content;
  
  // Remove all conflicting border classes from header rows
  updated = updated.replace(
    /className="([^"]*?)(?:border-b|border-neutral-200|border-border|border-bottom)([^"]*?)"/g,
    'className="$1$2"'
  );
  
  // Clean up double spaces and trailing spaces in className
  updated = updated.replace(/className="([^"]*?)\s+"/g, 'className="$1"');
  updated = updated.replace(/className="\s+([^"]*?)"/g, 'className="$1"');
  updated = updated.replace(/className="([^"]*?)\s+([^"]*?)"/g, 'className="$1 $2"');
  
  // Ensure section-start and section-end are properly applied in headers
  // This is a more conservative approach - we'll manually verify the structure
  
  return updated;
}

function fixTableComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixSectionBorders(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Updated: ${filePath}`);
      return true;
    } else {
      console.log(`✓ No changes needed: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing section borders globally across all table components...\n');

let updatedCount = 0;
tableComponents.forEach(component => {
  if (fixTableComponent(component)) {
    updatedCount++;
  }
});

console.log(`\n🎉 Completed: Updated ${updatedCount} table components with section border fixes.`);
console.log('📝 Note: Manual verification still needed for proper section-start/section-end placement.');