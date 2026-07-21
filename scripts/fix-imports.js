const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const allJsFiles = getAllFiles(srcDir);

// Build a map of filename (without .js) -> full path.
// For duplicate names like 'auth.js' we'll need to be careful, but mostly they are unique like 'user.service.js'
const fileMap = {};
allJsFiles.forEach(f => {
  const base = path.basename(f, '.js');
  // if already in map, make it an array
  if (fileMap[base]) {
    if (Array.isArray(fileMap[base])) {
      fileMap[base].push(f);
    } else {
      fileMap[base] = [fileMap[base], f];
    }
  } else {
    fileMap[base] = f;
  }
});

// We'll use a regex to find all requires
const requireRegex = /require\(['"]([^'"]+)['"]\)/g;

let totalFixed = 0;

allJsFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  content = content.replace(requireRegex, (match, reqPath) => {
    // Only care about relative imports
    if (!reqPath.startsWith('.')) return match;
    
    const absReqPath = path.resolve(path.dirname(file), reqPath);
    // If it resolves fine natively, skip
    if (fs.existsSync(absReqPath) || fs.existsSync(absReqPath + '.js') || fs.existsSync(absReqPath + '/index.js')) {
      return match;
    }

    // Try to guess from the last part of the path
    const parts = reqPath.split('/');
    let targetFile = parts[parts.length - 1];
    
    // We try to find targetFile in our fileMap
    let targetAbsPath = null;
    if (fileMap[targetFile]) {
      targetAbsPath = Array.isArray(fileMap[targetFile]) ? fileMap[targetFile][0] : fileMap[targetFile];
    } else if (fileMap[targetFile + '.routes']) {
        targetAbsPath = fileMap[targetFile + '.routes']; // heuristics
    }

    if (!targetAbsPath && reqPath.includes('config/')) {
        targetAbsPath = fileMap[targetFile] || fileMap['env'] || null;
    }

    if (targetAbsPath) {
      let newRelative = path.relative(path.dirname(file), targetAbsPath);
      // Ensure it starts with ./ or ../
      if (!newRelative.startsWith('.')) {
        newRelative = './' + newRelative;
      }
      newRelative = newRelative.replace(/\\/g, '/'); // forward slashes
      if (newRelative.endsWith('.js')) {
        newRelative = newRelative.slice(0, -3); // remove .js
      }
      changed = true;
      console.log(`Fixing ${reqPath} -> ${newRelative} in ${path.basename(file)}`);
      return `require("${newRelative}")`;
    }
    
    console.log(`Could not resolve ${reqPath} in ${file}`);
    return match;
  });

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    totalFixed++;
  }
});

console.log(`Fixed imports in ${totalFixed} files.`);
