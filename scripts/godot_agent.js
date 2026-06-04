const fs = require('fs');
const path = require('path');
const https = require('https');

// Helper: Parse CLI Arguments
const args = process.argv.slice(2);
let promptText = "";
let outPath = "";

for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--prompt' || args[i] === '-p') && i + 1 < args.length) {
    promptText = args[i + 1];
    i++;
  } else if ((args[i] === '--out' || args[i] === '-o') && i + 1 < args.length) {
    outPath = args[i + 1];
    i++;
  }
}

if (!promptText) {
  console.log(`
🤖 GamerDrift Godot 4.6 GDScript Code Agent
===========================================
Usage:
  node scripts/godot_agent.js --prompt "mechanic description" [--out path/to/script.gd]

Options:
  --prompt, -p   Detailed description of the game mechanic, node setup, or class to write.
  --out, -o      Output path to save the generated GDScript (defaults to outputting to console).

Examples:
  node scripts/godot_agent.js -p "A 2D drift car controller with skid marks" -o scripts/drift_car.gd
  node scripts/godot_agent.js -p "CharacterBody2D double jump and dash mechanic"
`);
  process.exit(0);
}

// Helper: Load Gemini API Key
function getApiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  
  // Try loading from .env.local
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || trimmed.startsWith('//') || !trimmed.includes('=')) {
          continue;
        }
        const [key, ...rest] = trimmed.split('=');
        if (key.trim() === 'GEMINI_API_KEY') {
          return rest.join('=').trim().replace(/^["']|["']$/g, '');
        }
      }
    }
  } catch (e) {
    // Ignore issues reading env
  }
  return null;
}

const apiKey = getApiKey();
if (!apiKey) {
  console.error("❌ Error: GEMINI_API_KEY is not set. Please set the GEMINI_API_KEY environment variable or add it to .env.local.");
  process.exit(1);
}

const systemInstruction = `You are an elite, senior game developer specializing in Godot Engine 4.6 and modern GDScript.
Your task is to write clean, production-ready, and highly optimized GDScript code for Godot 4.6 based on the user's prompt.

You MUST strictly follow these Godot 4.6/GDScript rules:
1. Use annotations for exports, signals, and onready variables:
   - Use '@onready var my_node = $MyNode' instead of 'onready var my_node = ...'
   - Use '@export var speed: float = 200.0' instead of 'export(float) var speed = ...'
   - Use '@export_group("Group Name")' for group settings if needed.
2. Signal connection and emission:
   - Connect signals using callable syntax: 'button.pressed.connect(_on_button_pressed)' instead of 'button.connect("pressed", self, "_on_button_pressed")'.
   - Emit signals using the '.emit()' syntax: 'my_signal.emit(arguments)' instead of 'emit_signal("my_signal", arguments)'.
3. Character movement (CharacterBody2D/CharacterBody3D):
   - Do NOT pass parameters to 'move_and_slide()'.
   - Assign the movement velocity to the built-in 'velocity' property of the body. E.g.:
     velocity = direction * speed
     move_and_slide()
4. Static Typing:
   - Always use static typing for variables, arguments, and return types where possible (e.g., 'var velocity: Vector2 = Vector2.ZERO', 'func take_damage(amount: float) -> void:').
   - For typed arrays, use the bracket notation: 'Array[Node2D]' or 'Array[String]'.
5. Scene Instantiation:
   - Use 'my_scene.instantiate()' instead of 'my_scene.instance()'.
6. Property/Function renames:
   - Use 'super()' or 'super.method_name()' instead of '.method_name()'.
   - Use 'queue_free()' for node destruction.
   - Use 'Time.get_ticks_msec()' instead of 'OS.get_ticks_msec()'.

Formatting rules:
- Provide ONLY valid GDScript code. Do NOT wrap the script in explanations or add text outside of comments in the GDScript code itself.
- Place a documentation comment at the top of the script detailing:
  - What the script does.
  - The node requirements/tree setup required for the script to function (e.g., 'Requires: CharacterBody2D as parent, CollisionShape2D, Sprite2D').
  - Any exported variables or custom settings that can be customized in the inspector.
- Ensure the output can be written directly to a '.gd' file and loaded directly into Godot without syntax errors.`;

// Call Gemini API
function callGemini(key, prompt, systemPrompt) {
  return new Promise((resolve, reject) => {
    // Using gemini-2.5-flash as the latest standard model
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    
    const requestBody = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      systemInstruction: {
        parts: [{
          text: systemPrompt
        }]
      },
      generationConfig: {
        temperature: 0.1, // low temperature for precise code generation
        maxOutputTokens: 8192
      }
    });

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(requestBody)
      }
    };

    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Gemini API returned status ${res.statusCode}: ${data}`));
        } else {
          try {
            const responseJson = JSON.parse(data);
            if (responseJson.candidates && responseJson.candidates[0] && responseJson.candidates[0].content && responseJson.candidates[0].content.parts[0]) {
              resolve(responseJson.candidates[0].content.parts[0].text);
            } else {
              reject(new Error("Invalid response format from Gemini API: " + JSON.stringify(responseJson)));
            }
          } catch (e) {
            reject(new Error("Failed to parse Gemini response JSON: " + e.message));
          }
        }
      });
    });

    req.on('error', (err) => { reject(err); });
    req.write(requestBody);
    req.end();
  });
}

function extractGdscript(response) {
  const regex = /```gdscript\s*([\s\S]*?)```/i;
  const match = response.match(regex);
  if (match) {
    return match[1].trim();
  }
  const genericRegex = /```\s*([\s\S]*?)```/;
  const genericMatch = response.match(genericRegex);
  if (genericMatch) {
    return genericMatch[1].trim();
  }
  return response.trim();
}

console.log(`🧠 Querying GamerDrift Godot Agent for: "${promptText}"...`);

callGemini(apiKey, promptText, systemInstruction)
  .then(rawResponse => {
    const gdCode = extractGdscript(rawResponse);
    
    if (outPath) {
      const resolvedOutPath = path.isAbsolute(outPath) ? outPath : path.join(process.cwd(), outPath);
      const dir = path.dirname(resolvedOutPath);
      
      try {
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(resolvedOutPath, gdCode, 'utf8');
        console.log(`\n✓ Success: GDScript generated and saved to ${resolvedOutPath}`);
      } catch (err) {
        console.error(`\n❌ Error: Failed to write to file ${resolvedOutPath}. Details: ${err.message}`);
        console.log("\n--- Generated GDScript ---");
        console.log(gdCode);
      }
    } else {
      console.log("\n--- Generated GDScript ---");
      console.log(gdCode);
      console.log("--------------------------");
    }
  })
  .catch(err => {
    console.error(`\n❌ Gemini API Request failed: ${err.message}`);
    process.exit(1);
  });
