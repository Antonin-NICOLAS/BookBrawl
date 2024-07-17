const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'avatars',
    public_id: (req, file) => {
      const prenom = req.user.prenom;
      return `${prenom}-${file.originalname}`;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = upload;