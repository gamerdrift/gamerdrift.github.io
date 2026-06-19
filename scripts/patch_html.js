const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'public', 'games', 'rogueghost', 'index.html');
const templatePath = path.join(__dirname, '..', 'rogue_ghost', 'index_template.html');

console.log("🛠️ Starting HTML Patching...");

if (!fs.existsSync(htmlPath)) {
	console.error("❌ Error: Generated index.html not found at " + htmlPath);
	process.exit(1);
}

if (!fs.existsSync(templatePath)) {
	console.error("❌ Error: index_template.html not found at " + templatePath);
	process.exit(1);
}

// 1. Read the generated HTML
const generatedHtml = fs.readFileSync(htmlPath, 'utf8');

// 2. Extract the GODOT_CONFIG line
const configRegex = /const GODOT_CONFIG = (\{.*?\});/;
const match = generatedHtml.match(configRegex);

if (!match) {
	console.error("❌ Error: Could not find GODOT_CONFIG in generated HTML.");
	process.exit(1);
}

let configStr = match[1];
console.log("🔍 Extracted GODOT_CONFIG: " + configStr);

// 3. Parse and modify config: set ensureCrossOriginIsolationHeaders to false
try {
	const config = JSON.parse(configStr);
	config.ensureCrossOriginIsolationHeaders = false;
	configStr = JSON.stringify(config);
	console.log("⚙️ Successfully set ensureCrossOriginIsolationHeaders to false in config.");
} catch (err) {
	console.warn("⚠️ Failed to parse config JSON, executing string replacement fallback.");
	configStr = configStr.replace('"ensureCrossOriginIsolationHeaders":true', '"ensureCrossOriginIsolationHeaders":false');
}

// 4. Read the template
let templateHtml = fs.readFileSync(templatePath, 'utf8');

// 5. Replace placeholder
const patchedConfigLine = `const GODOT_CONFIG = ${configStr};`;
templateHtml = templateHtml.replace('// {{GODOT_CONFIG}}', patchedConfigLine);

// 6. Write back to index.html
fs.writeFileSync(htmlPath, templateHtml, 'utf8');
console.log("✅ Patched custom tactical preloader index.html successfully!");
