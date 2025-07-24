#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Helper function to determine field type based on field name and context
function getFieldType(fieldName, context) {
  const currencyFields = ['amount', 'coverAmount', 'monthlyIncome', 'approvedLifeCover', 'fundValue', 
    'fundValueAtDeath', 'lumpSumTaken', 'nondeductibleContribution', 'livingAnnuity', 
    'escalationAmount', 'deathBenefit', 'premiumsByOthers', 'collateralSession',
    'baseCost', 'marketValue', 'spouse', 'others', 'benefit', 'finalMonthlySalary',
    'deathLumpSum', 'additionalTaxFreeAmount', 'pensionIncomeAmount'];
  
  const percentageFields = ['percentage', 'split', 'increase', 'beneficiaryPercentageSplit',
    'pensionIncomeIncrease', 'increasePercentage', 'liquidationPercentage'];
  
  const yearsFields = ['years', 'termYears', 'incomeTerm', 'yearsOfService'];
  
  if (currencyFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()))) {
    return 'currency';
  } else if (percentageFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()))) {
    return 'percentage';
  } else if (yearsFields.some(field => fieldName.toLowerCase().includes(field.toLowerCase()))) {
    return 'years';
  } else if (fieldName.includes('description') || fieldName.includes('name') || fieldName.includes('owner')) {
    return 'text';
  } else {
    return 'text';
  }
}

// Find all React component files in the client directory
function findComponentFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      files.push(...findComponentFiles(fullPath));
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function applyDefaultValueStyling(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  let newContent = content;
  
  // Check if file already imports getValueClass
  const hasGetValueClassImport = content.includes('getValueClass');
  
  // Add import if not present and file has input fields
  if (!hasGetValueClassImport && content.includes('defaultValue={')) {
    // Find existing formatting imports
    const formattingImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+["']@\/lib\/formatting["'];/);
    if (formattingImportMatch) {
      const imports = formattingImportMatch[1];
      if (!imports.includes('getValueClass')) {
        const newImports = imports.trim() + ', getValueClass, isDefaultValue';
        newContent = newContent.replace(formattingImportMatch[0], 
          `import { ${newImports} } from "@/lib/formatting";`);
        modified = true;
      }
    } else {
      // Add new import after existing imports
      const lastImportMatch = content.match(/import[^;]+;(?=\s*\n\s*(?:interface|export|const|function))/g);
      if (lastImportMatch) {
        const lastImport = lastImportMatch[lastImportMatch.length - 1];
        newContent = newContent.replace(lastImport, 
          lastImport + '\nimport { getValueClass, isDefaultValue } from "@/lib/formatting";');
        modified = true;
      }
    }
  }
  
  // Pattern to match input elements with defaultValue and className
  const inputPattern = /(<input[^>]*)\s+className=\{([^}]+)\}([^>]*defaultValue=\{([^}]+)\}[^>]*>)/g;
  
  newContent = newContent.replace(inputPattern, (match, beforeClass, className, afterClass, defaultValue) => {
    // Extract field name from various patterns
    const fieldMatches = [
      afterClass.match(/onBlur=\{[^}]*'(\w+)'[^}]*\}/),
      defaultValue.match(/(\w+)\.(\w+)/),
      beforeClass.match(/key=\{[^}]*(\w+)[^}]*\}/),
    ];
    
    let fieldName = 'text';
    for (const fieldMatch of fieldMatches) {
      if (fieldMatch) {
        fieldName = fieldMatch[2] || fieldMatch[1];
        break;
      }
    }
    
    const fieldType = getFieldType(fieldName, match);
    
    // Check if className already includes getValueClass
    if (className.includes('getValueClass')) {
      return match; // Already has conditional styling
    }
    
    // Add conditional styling
    const newClassName = `\`\${${className}} \${getValueClass(${defaultValue}, '${fieldType}')}\``;
    const newInput = `${beforeClass} className={${newClassName}}${afterClass}`;
    
    modified = true;
    return newInput;
  });
  
  // Write file if modified
  if (modified) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const clientDir = path.join(__dirname, '..', 'client', 'src');
const componentFiles = findComponentFiles(clientDir);

let totalUpdated = 0;

for (const file of componentFiles) {
  try {
    if (applyDefaultValueStyling(file)) {
      totalUpdated++;
    }
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
}

console.log(`\nProcessed ${componentFiles.length} files`);
console.log(`Updated ${totalUpdated} files with default value styling`);