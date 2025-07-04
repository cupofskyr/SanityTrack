const fs = require('fs');
const path = require('path');
const recast = require('recast');
const { visit } = require('ast-types');

const SRC_DIR = './src';

function escapeEntities(text) {
  return text
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;');
}

function processFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const ast = recast.parse(code, {
    parser: require('recast/parsers/typescript'),
  });

  let modified = false;

  visit(ast, {
    visitJSXText(path) {
      const original = path.node.value;
      const escaped = escapeEntities(original);
      if (original !== escaped) {
        path.node.value = escaped;
        modified = true;
      }
      this.traverse(path);
    },
  });

  if (modified) {
    fs.writeFileSync(filePath, recast.print(ast).code, 'utf8');
    console.log(`Fixed entities in ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.jsx')) {
      processFile(fullPath);
    }
  }
}

walkDir(SRC_DIR);
console.log('Done fixing unescaped entities.');
