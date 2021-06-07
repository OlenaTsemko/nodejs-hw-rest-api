const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const createFolderIsNotExist = require('../helpers/create-dir');

class UploadAvatar {
  constructor(AVATARS_DIR) {
    this.AVATARS_DIR = AVATARS_DIR;
  }

  async transformAvatar(pathFile) {
    const file = await Jimp.read(pathFile);
    await file
      .autocrop()
      .cover(
        250,
        250,
        Jimp.HORIZONTAL_ALIGN_CENTER | Jimp.VERTICAL_ALIGN_MIDDLE,
      )
      .writeAsync(pathFile);
  }

  async saveAvatarToStatic({ idUser, pathFile, nameFile, oldFile }) {
    await this.transformAvatar(pathFile);
    const folderUserAvatar = path.join(this.AVATARS_DIR, idUser);
    await createFolderIsNotExist(folderUserAvatar);

    await fs.rename(pathFile, path.join(folderUserAvatar, nameFile));
    await this.deleteOldAvatar(
      path.join(process.cwd(), this.AVATARS_DIR, oldFile),
    );

    const avatarUrl = path.normalize(path.join(idUser, nameFile));

    return avatarUrl;
  }

  async deleteOldAvatar(pathFile) {
    try {
      if (pathFile.includes('s.gravatar.com')) {
        return;
      }
      await fs.unlink(pathFile);
    } catch (error) {
      console.error('error.message', error.message);
    }
  }
}

module.exports = UploadAvatar;
