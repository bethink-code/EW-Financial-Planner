#!/usr/bin/env node

/**
 * Script to systematically update all table input fields to use standardized field widths
 * from the field types system instead of w-full classes
 */

const fs = require('fs');
const path = require('path');

// Mapping of field names to field types for consistent replacement
const fieldMappings = {
  // Text fields (150-300px)
  'description': 'description',
  'categoryAndDescription': 'description', 
  'entity': 'name',
  'owner': 'name',
  'beneficiary': 'name',
  'lifeAssured': 'name',
  'currency': 'name',
  'frequency': 'name',
  
  // Currency fields (90-180px)
  'amount': 'amount',
  'baseCost': 'amount',
  'marketValue': 'amount',
  'deathBenefit': 'amount',
  'capitalisedAmount': 'amount',
  'spouse': 'amount',
  'others': 'amount',
  
  // Percentage fields (60-90px)
  'percentage': 'percentage',
  'donaldEdwardsPercentage': 'percentage',
  'bettyEdwardsPercentage': 'percentage',
  'liquidationPercentage': 'percentage',
  'taxablePercentage': 'percentage',
  'taxPercentage': 'percentage',
  'increasePercentage': 'percentage',
  'ownershipPercentages': 'percentage',
  
  // Years fields (80-100px)
  'start': 'years',
  'termYears': 'years',
  'years': 'years'
};

// Function to determine field type from field name or onBlur handler
function getFieldType(fieldName, onBlurHandler = '') {
  // Direct mapping
  if (fieldMappings[fieldName]) {
    return fieldMappings[fieldName];
  }
  
  // Pattern matching for common field patterns
  if (fieldName.includes('percentage') || fieldName.includes('Percentage')) {
    return 'percentage';
  }
  
  if (fieldName.includes('amount') || fieldName.includes('Amount') || 
      fieldName.includes('cost') || fieldName.includes('Cost') ||
      fieldName.includes('value') || fieldName.includes('Value')) {
    return 'amount';
  }
  
  if (fieldName.includes('year') || fieldName.includes('Year') ||
      fieldName.includes('term') || fieldName.includes('Term') ||
      onBlurHandler.includes('years')) {
    return 'years';
  }
  
  // Default to text field for names, descriptions, etc.
  return 'name';
}

// Function to process a single file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if file already has getFieldClass import
    if (!content.includes('getFieldClass')) {
      // Add import for getFieldClass and getFieldWidth
      const importMatch = content.match(/import.*from.*["']@\/lib\/.*["'];?\n/);
      if (importMatch) {
        const lastImportIndex = content.lastIndexOf(importMatch[0]) + importMatch[0].length;
        content = content.slice(0, lastImportIndex) + 
                 `import { getFieldClass, getFieldWidth } from "@/lib/design-tokens";\n` +
                 content.slice(lastImportIndex);
        modified = true;
      } else {
        // Add import after the last import statement
        const lastImportMatch = content.match(/^import.*$/gm);
        if (lastImportMatch) {
          const lastImport = lastImportMatch[lastImportMatch.length - 1];
          const lastImportIndex = content.indexOf(lastImport) + lastImport.length;
          content = content.slice(0, lastImportIndex) + 
                   `\nimport { getFieldClass, getFieldWidth } from "@/lib/design-tokens";` +
                   content.slice(lastImportIndex);
          modified = true;
        }
      }
    }
    
    // Pattern to match table input fields with w-full
    const inputPattern = /(<input[\s\S]*?)className="([^"]*table-input[^"]*w-full[^"]*)"([^>]*>)/g;
    const selectPattern = /(<select[\s\S]*?)className="([^"]*table-input[^"]*w-full[^"]*)"([^>]*>)/g;
    
    // Process input fields
    content = content.replace(inputPattern, (match, before, className, after) => {
      // Extract field name from defaultValue, onBlur, or onChange
      const fieldMatch = before.match(/(?:onBlur.*?'(\w+)'|defaultValue={.*?\.(\w+)}|value={.*?\.(\w+)})/);
      const fieldName = fieldMatch ? (fieldMatch[1] || fieldMatch[2] || fieldMatch[3]) : 'name';
      const fieldType = getFieldType(fieldName, match);
      
      const newClassName = className.replace(/\s*w-full\s*/, ' ').replace(/\s+/g, ' ').trim();
      const updatedInput = `${before}className={getFieldClass('${fieldType}')}${after.includes('style=') ? '' : `\n                    style={getFieldWidth('${fieldType}')}`}`;
      
      modified = true;
      return updatedInput;
    });
    
    // Process select fields  
    content = content.replace(selectPattern, (match, before, className, after) => {
      const fieldMatch = before.match(/(?:onChange.*?'(\w+)'|value={.*?\.(\w+)})/);
      const fieldName = fieldMatch ? (fieldMatch[1] || fieldMatch[2]) : 'name';
      const fieldType = getFieldType(fieldName, match);
      
      const newClassName = className.replace(/\s*w-full\s*/, ' ').replace(/\s+/g, ' ').trim();
      const updatedSelect = `${before}className={getFieldClass('${fieldType}')}${after.includes('style=') ? '' : `\n                    style={getFieldWidth('${fieldType}')}`}`;
      
      modified = true;
      return updatedSelect;
    });
    
    // Write back if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively find and process table component files
function processDirectory(dirPath) {
  let filesProcessed = 0;
  
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      filesProcessed += processDirectory(fullPath);
    } else if (item.endsWith('-table.tsx') || item.includes('table')) {
      if (processFile(fullPath)) {
        filesProcessed++;
      }
    }
  }
  
  return filesProcessed;
}

// Main execution
function main() {
  const componentsDir = path.join(__dirname, '../client/src/components');
  
  console.log('Starting field width standardization...');
  const filesProcessed = processDirectory(componentsDir);
  console.log(`Completed! Processed ${filesProcessed} files.`);
}

main();