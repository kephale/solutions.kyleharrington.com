const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const catalogs = require('./catalogs.json').catalogs;
const catalogDir = path.resolve(__dirname, '../catalogs');
if (!fs.existsSync(catalogDir)) {
  fs.mkdirSync(catalogDir);
}

catalogs.forEach((catalogUrl, index) => {
  const catalogName = `catalog${index + 1}`;
  const catalogPath = path.join(catalogDir, catalogName);

  if (fs.existsSync(catalogPath)) {
    execSync(`git -C ${catalogPath} pull`, { stdio: 'inherit' });
  } else {
    execSync(`git clone ${catalogUrl} ${catalogPath}`, { stdio: 'inherit' });
  }

  const dbSrcPath = path.join(catalogPath, 'album_catalog_index.db');
  const dbDestPath = path.join(catalogDir, `${catalogName}.db`);

  if (fs.existsSync(dbSrcPath)) {
    fs.copyFileSync(dbSrcPath, dbDestPath);
  }
});
