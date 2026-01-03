const fs = require('fs');
const path = require('path');

// Helper to get absolute path for data files
function getDataFilePath(filename) {
  return path.join(__dirname, 'data', filename);
}

// Read JSON file safely
function readJsonFile(filename) {
  const filePath = getDataFilePath(filename);
  try {
    if (!fs.existsSync(filePath)) return [];
    const data = fs.readFileSync(filePath, 'utf-8');
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Write JSON file safely
function writeJsonFile(filename, data) {
  const filePath = getDataFilePath(filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};
