const path = require('path');
const app = require('../app');
const db = require('../model/db');
const createFolderIsNotExist = require('../helpers/create-dir');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = process.env.UPLOAD_DIR;
const AVATARS_DIR = path.join('public', process.env.AVATARS_DIR);

db.then(() => {
  app.listen(PORT, async () => {
    await createFolderIsNotExist(UPLOAD_DIR);
    await createFolderIsNotExist(AVATARS_DIR);
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch(error => {
  console.log(`Server not run. Error: ${error.message}`);
  process.exit(1);
});
