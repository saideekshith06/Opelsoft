const fs = require('fs');
const path = require('path');

const possiblePaths = [
  'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\tempmediaStorage\\media__1780504915888.png',
  'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\tempmediaStorage\\media__1780502390735.png'
];

const dest = 'c:\\Users\\ASUS\\Desktop\\hemanth\\Opelsoft\\public\\logo.png';

let copied = false;
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, dest);
    console.log(`Copied ${p} to ${dest}`);
    copied = true;
    break;
  }
}

if (!copied) {
  // Let's list tempmediaStorage to see if there is any other png there
  const dir = 'C:\\Users\\ASUS\\.gemini\\antigravity\\brain\\tempmediaStorage';
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    console.log(`Available files in tempmediaStorage: ${files.join(', ')}`);
    // Find the newest file
    const pngs = files.filter(f => f.endsWith('.png'));
    if (pngs.length > 0) {
      // Sort by stats mtime
      const sorted = pngs.map(f => ({
        name: f,
        time: fs.statSync(path.join(dir, f)).mtimeMs
      })).sort((a, b) => b.time - a.time);
      const newest = path.join(dir, sorted[0].name);
      fs.copyFileSync(newest, dest);
      console.log(`Fallback: Copied newest file ${newest} to ${dest}`);
      copied = true;
    }
  }
}

if (!copied) {
  console.error('Failed to copy any logo file.');
}
