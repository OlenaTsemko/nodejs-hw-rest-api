const fs = require('fs/promises');

class UploadAvatar {
  constructor(uploadCloud) {
    this.uploadCloud = uploadCloud;
  }

  async saveAvatarToCloud(pathFile, userIdImg) {
    const { public_id: publicId, secure_url: secureUrl } =
      await this.uploadCloud(pathFile, {
        public_id: userIdImg?.replace('Photo/', ''),
        folder: 'Photo',
        transformation: { width: 250, crop: 'pad' },
      });

    await this.deleteTemporyFile(pathFile);
    return { userIdImg: publicId, avatarUrl: secureUrl };
  }

  async deleteTemporyFile(pathFile) {
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
