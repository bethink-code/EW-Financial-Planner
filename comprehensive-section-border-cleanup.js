#!/usr/bin/env node

import fs from 'fs';

// All table components that need comprehensive cleanup
const tableComponents = [
  'client/src/components/assets/assets-table.tsx',
  'client/src/components/liabilities/liabilities-table.tsx',
  'client/src/components/defined-benefit-funds/defined-benefit-funds-table.tsx',
  'client/src/components/voluntary-investments/voluntary-investments-table.tsx',
  'client/src/components/lump-sum-bequests/lump-sum-table.tsx',
  'client/src/components/residue/residue-table.tsx',
  'client/src/components/additional-estate-duty-items/additional-estate-duty-items-table.tsx',
  'client/src/components/assurance/assurance-table.tsx',
  'client/src/components/retirement-funds/simple-table-with-beneficiaries.tsx',
  'client/src/components/income-provisions/income-provisions-table.tsx',
  'client/src/components/income-needs/income-needs-table.tsx'
];

function comprehensiveCleanup(content) {
  let updated = content;
  
  // Step 1: Remove ALL conflicting border classes from table elements
  const borderClassesToRemove = ['border-b', 'border-neutral-200', 'border-border', 'border-bottom', 'border-t', 'border-top', 'border', 'border-neutral-300', 'border-gray-300'];
  
  borderClassesToRemove.forEach(borderClass => {
    // Remove from className attributes
    updated = updated.replace(new RegExp(`\\s+${borderClass}\\s+`, 'g'), ' ');
    updated = updated.replace(new RegExp(`\\s+${borderClass}"`, 'g'), '"');
    updated = updated.replace(new RegExp(`"${borderClass}\\s+`, 'g'), '"');
    updated = updated.replace(new RegExp(`"${borderClass}"`, 'g'), '""');
  });
  
  // Step 2: Remove duplicate section classes
  updated = updated.replace(/section-start\s+section-start/g, 'section-start');
  updated = updated.replace(/section-end\s+section-end/g, 'section-end');
  
  // Step 3: Clean up empty className attributes
  updated = updated.replace(/className="(\s*)"/g, '');
  updated = updated.replace(/className="\s+"/g, '');
  
  // Step 4: Fix specific section border patterns for common table structures
  
  // Fix second header row cells - common patterns
  updated = updated.replace(
    /(<th[^>]*className="[^"]*?)("\s*[^>]*>)\s*Description\s*<\/th>/gi,
    '$1 section-start$2Description</th>'
  );
  
  updated = updated.replace(
    /(<th[^>]*className="[^"]*?)("\s*[^>]*>)\s*Amount\s*<\/th>/gi,
    '$1 section-start$2Amount</th>'
  );
  
  updated = updated.replace(
    /(<th[^>]*className="[^"]*?)("\s*[^>]*>)\s*Increase %\s*<\/th>/gi,
    '$1 section-end$2Increase %</th>'
  );
  
  // Step 5: Fix footer cells - totals should have proper section borders
  updated = updated.replace(
    /(<td[^>]*className="[^"]*?totals-cell-value[^"]*?)(")/gi,
    '$1 section-start$2'
  );
  
  updated = updated.replace(
    /(<td[^>]*className="[^"]*?totals-cell-label[^"]*?)("[^>]*><\/td>)/gi,
    '$1 section-end$2'
  );
  
  // Step 6: Clean up extra spaces and normalize class names
  updated = updated.replace(/className="([^"]*?)\s+"/g, 'className="$1"');
  updated = updated.replace(/className="\s+([^"]*?)"/g, 'className="$1"');
  updated = updated.replace(/\s+/g, ' ');
  
  // Step 7: Remove tr border classes specifically
  updated = updated.replace(/<tr className="border-b border-border">/g, '<tr>');
  updated = updated.replace(/<tr className="border-border border-b">/g, '<tr>');
  
  return updated;
}

function fixTableComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = comprehensiveCleanup(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Comprehensive cleanup: ${filePath}`);
      return true;
    } else {
      console.log(`✓ Already clean: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Performing comprehensive section border cleanup...\n');

let updatedCount = 0;
tableComponents.forEach(component => {
  if (fixTableComponent(component)) {
    updatedCount++;
  }
});

console.log(`\n🎉 Completed comprehensive cleanup on ${updatedCount} table components.`);
console.log('📝 All conflicting border classes removed, section borders normalized.');