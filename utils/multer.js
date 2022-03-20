// var multer = require('multer');
// //multer.diskStorage() creates a storage space for storing files.
// var storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         if (
//             file.mimetype === 'video/mp4' ||
//             file.mimetype === 'video/avi' ||
//             file.mimetype === 'video/mpeg' ||
//             file.mimetype === 'image/jpeg' ||
//             file.mimetype === 'image/png'
//         ) {
//             cb(null, './files/uploads/');
//         } else {
//             cb({ message: 'this file is neither a video or image file' }, false);
//         }
//     },
//     filename: function(req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     },
// });
// var upload = multer({ storage: storage });
// module.exports = upload;
const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        //reject file
        cb({
                message: 'Unsupported file format',
            },
            false
        );
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024
    },
    fileFilter: fileFilter
});

module.exports = upload;