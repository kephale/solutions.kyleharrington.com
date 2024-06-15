const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const catalogs = require('./catalogs.json').catalogs;
const solutionsDir = path.resolve(__dirname, 'solutions');

if (!fs.existsSync(solutionsDir)) {
  fs.mkdirSync(solutionsDir);
}

catalogs.forEach((catalogUrl, index) => {
  const catalogName = `catalog${index + 1}`;
  const catalogPath = path.join(solutionsDir, catalogName);

  if (fs.existsSync(catalogPath)) {
    execSync(`git -C ${catalogPath} pull`, { stdio: 'inherit' });
  } else {
    execSync(`git clone ${catalogUrl} ${catalogPath}`, { stdio: 'inherit' });
  }
});
