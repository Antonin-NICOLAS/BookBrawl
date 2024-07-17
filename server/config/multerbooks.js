const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');
const slugify = require('slugify');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'books',
    public_id: (req) => {
      const { BookTitle } = req.query;
      const sanitizedTitle = slugify(BookTitle, {
        replacement: '_',  // Remplace les espaces et autres caractères non valides par des underscores
        remove: /[*+~.()'"!:@]/g,  // Supprime les caractères spéciaux qui ne sont pas autorisés
        lower: true,  // Convertit en minuscules
        strict: true  // Applique un slug strict, remplaçant les caractères non conformes par des underscores
      });

      return sanitizedTitle;
    },
  },
});

const upload = multer({ storage: storage });

module.exports = upload;