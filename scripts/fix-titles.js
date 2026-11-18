const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'gallery-data.json');
let content = fs.readFileSync(dataPath, 'utf-8');

// Replace \"title\":\"Foto Kegiatan 10\" or "title":"Foto Kegiatan 10" with -
content = content.replace(/\\?"title\\?":\\?"Foto Kegiatan \d+\\?"/g, '\\"title\\":\\"-\\"');

fs.writeFileSync(dataPath, content, 'utf-8');
console.log('✅ gallery-data.json titles fixed!');
