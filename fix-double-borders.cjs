const fs = require('fs');
const path = require('path');

// Files that have double border issues
const filesToFix = [
  'client/src/components/additional-estate-duty-items/additional-estate-duty-items-table.tsx',
  'client/src/components/assurance/assurance-table.tsx',
  'client/src/components/defined-benefit-funds/defined-benefit-funds-table-correct.tsx',
  'client/src/components/defined-benefit-funds/defined-benefit-funds-table.tsx',
  'client/src/components/income-provisions/income-provisions-table-new.tsx',
  'client/src/components/income-provisions/income-provisions-table.tsx',
  'client/src/components/lump-sum-bequests/lump-sum-table.tsx',
  'client/src/components/retirement-funds/new-retirement-table.tsx'
];

console.log('Fixing double border issues by removing section-end classes...');

filesToFix.forEach(file => {
  try {
    if (!fs.existsSync(file)) {
      console.log(`File not found: ${file}`);
      return;
    }
    
    let content = fs.readFileSync(file, 'utf8');
    const originalContent = content;
    
    // Remove all instances of 'section-end' class while preserving 'section-start'
    content = content.replace(/section-start section-end/g, 'section-start');
    content = content.replace(/section-end section-start/g, 'section-start');
    content = content.replace(/section-end/g, '');
    
    // Clean up double spaces that might be left behind
    content = content.replace(/  +/g, ' ');
    content = content.replace(/className=" /g, 'className="');
    content = content.replace(/ "/g, '"');
    
    if (content !== originalContent) {
      fs.writeFileSync(file, content);
      console.log(`✓ Fixed double borders in: ${file}`);
    } else {
      console.log(`- No changes needed in: ${file}`);
    }
  } catch (error) {
    console.error(`✗ Error processing ${file}:`, error.message);
  }
});

console.log('Double border fix complete!');