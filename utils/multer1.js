// const multer = require('multer');
// const path = require('path');
// //specify storage

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, './uploads/');
//     },
//     filename: function(req, file, cb) {
//         cb(null, Date.now() + '-' + file.originalname);
//     },
// });

// // file validation

// const fileFilter = (req, file, cb) => {
//     if (
//         file.mimetype === 'image/jpg' ||
//         file.mimetype === 'image/jpeg' ||
//         file.mimetype === 'image/png' ||
//         file.mimetype === 'video/avi' ||
//         file.mimetype === 'video/mpeg' ||
//         file.mimetype === 'video/mp4'
//     ) {
//         cb(null, true);
//     } else {
//         // unable to upload
//         cb({ message: 'unsupported file format' }, false);
//     }
// };

// module.exports = multer({
//     storage: storage,
//     // limits: { fileSize: 1024 * 1024 },
//     fileFilter: fileFilter,
// });
// // module.exports = upload;
// // module.exports = multer;
// //multer config
// // module.exports = multer({
// //     storage: multer.diskStorage({}),
// //     fileFilter: (req, file, cb) => {
// //         const ext = path.extname(file.originalname);
// //         if (
// //             ext !== '.jpg' &&
// //             ext !== '.jpeg' &&
// //             ext !== '.png' &&
// //             ext !== '.gif' &&
// //             ext !== '.mpg' &&
// //             ext !== '.avi' &&
// //             ext !== '.mpeg' &&
// //             ext !== '.mp4'
// //         ) {
// //             cb(new Error('File type not supported'), false);
// //             return;
// //         }
// //         cb(null, true);
// //     },
// // });