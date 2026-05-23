const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Vidya', 'Desktop', 'gamerdrift.github.io', 'gamerdrift.github.io', 'index.html');
console.log('Checking file:', filePath);

try {
  const html = fs.readFileSync(filePath, 'utf8');
  const scriptRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let count = 0;
  let errors = 0;
  
  while ((match = scriptRegex.exec(html)) !== null) {
    const code = match[1];
    // Skip external script tags
    if (match[0].includes('src=')) continue;
    
    if (code.trim()) {
      count++;
      try {
        // Use VM module to check syntax of the block
        const vm = require('vm');
        new vm.Script(code, { filename: `script_block_${count}.js` });
        console.log(`✅ Script block ${count}: Syntax OK`);
      } catch (e) {
        errors++;
        console.error(`❌ Script block ${count}: Syntax ERROR`);
        console.error(e.stack);
      }
    }
  }
  
  if (errors === 0) {
    console.log('\n🎉 SUCCESS: All script blocks have valid syntax!');
    process.exit(0);
  } else {
    console.error(`\n🚨 FAILURE: Found ${errors} script blocks with syntax errors.`);
    process.exit(1);
  }
} catch (e) {
  console.error('Failed to read or parse file:', e.message);
  process.exit(1);
}
