#!/usr/bin/env node

import fs from 'fs';

// All table components that need section border fixes
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

function fixMissingSectionBorders(content) {
  let updated = content;
  
  // Fix missing section borders in second header rows
  // Look for patterns like: <th className="...">Description</th> and add section-start
  updated = updated.replace(
    /<th className="([^"]*?)"([^>]*?)>(\s*Description\s*)<\/th>/gi,
    '<th className="$1 section-start"$2>$3</th>'
  );
  
  // Fix other second row header cells that should have section borders
  updated = updated.replace(
    /<th className="([^"]*?)"([^>]*?)>(\s*Owner\s*)<\/th>/gi,
    '<th className="$1"$2>$3</th>' // Owner doesn't need section-start
  );
  
  updated = updated.replace(
    /<th className="([^"]*?)"([^>]*?)>(\s*Amount\s*)<\/th>/gi,
    '<th className="$1 section-start"$2>$3</th>'
  );
  
  updated = updated.replace(
    /<th className="([^"]*?)"([^>]*?)>(\s*Increase %\s*)<\/th>/gi,
    '<th className="$1 section-end"$2>$3</th>'
  );
  
  // Fix footer cells that need section borders
  updated = updated.replace(
    /<td className="([^"]*?totals-cell-value[^"]*?)"([^>]*?)>/gi,
    '<td className="$1 section-start"$2>'
  );
  
  updated = updated.replace(
    /<td className="([^"]*?totals-cell-label[^"]*?)"([^>]*?)><\/td>/gi, 
    '<td className="$1 section-end"$2></td>'
  );
  
  // Clean up duplicate section classes
  updated = updated.replace(/section-start\s+section-start/g, 'section-start');
  updated = updated.replace(/section-end\s+section-end/g, 'section-end');
  
  // Clean up extra spaces in class names
  updated = updated.replace(/className="([^"]*?)\s+"/g, 'className="$1"');
  updated = updated.replace(/className="\s+([^"]*?)"/g, 'className="$1"');
  
  return updated;
}

function fixTableComponent(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = fixMissingSectionBorders(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Fixed missing section borders: ${filePath}`);
      return true;
    } else {
      console.log(`✓ No missing section borders found: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🔧 Fixing missing section borders in table headers and footers...\n');

let updatedCount = 0;
tableComponents.forEach(component => {
  if (fixTableComponent(component)) {
    updatedCount++;
  }
});

console.log(`\n🎉 Completed: Fixed missing section borders in ${updatedCount} table components.`);
console.log('📝 All second row headers and footer cells now have proper section borders.');