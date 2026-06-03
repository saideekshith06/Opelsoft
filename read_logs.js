const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFile = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\0f7e84bb-5e06-4797-b286-5d3c650f972e\\.system_generated\\logs\\transcript.jsonl';

if (!fs.existsSync(logFile)) {
  console.error(`Log file not found: ${logFile}`);
  process.exit(1);
}

const rl = readline.createInterface({
  input: fs.createReadStream(logFile),
  crlfDelay: Infinity
});

console.log('--- USER INPUT HISTORY ---');
rl.on('line', (line) => {
  try {
    const step = JSON.parse(line);
    // Find USER_INPUT steps
    if (step.type === 'USER_INPUT' || step.source === 'USER_EXPLICIT') {
      console.log(`[Step ${step.step_index}] ${step.content}`);
    }
  } catch (err) {
    // ignore parsing errors
  }
});

rl.on('close', () => {
  console.log('--- END OF HISTORY ---');
});
