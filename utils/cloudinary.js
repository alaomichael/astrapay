// config cloudinary

// const dotenv = require('dotenv');

// dotenv.config();
// const cloudinary = require('cloudinary').v2;

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// exports.uploads = async(req, res) => {
//     // const squirtleImage = req.files.pokemon;
//     const squirtleImage = req.files.image || req.files.video;
//     // this function will upload to cloudinary
//     function uploader() {
//         return new Promise(function(resolve, reject) {
//             cloudinary.uploader.upload(
//                 squirtleImage.tempFilePath,
//                 function(result, err) {
//                     if (err) {
//                         console.log(err);
//                     }

//                     resolve(result);
//                 }
//             );
//         });
//     }

//     var data = await uploader();
//     console.log(data);
//     res.send(data);
// };
// module.exports = cloudinary;
// cloudinary.config({
//     api_secret: process.env.CLOUDINARY_API_SECRET,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     cloud_name: process.env.CLOUDINARY_NAME,
// });

// exports.uploads = (file, folder) => {
//     return new Promise(resolve => {
//         cloudinary.uploader.upload(file, (result) => {
//             resolve({
//                 url: result.url,
//                 id: result.public_id
//             })
//         }, {
//             resource_type: "auto",
//             folder: folder
//         })
//     })
// }

// exports.uploads = (file) => {
//     return new Promise((resolve) => {
//         cloudinary.uploader.upload(
//             file,
//             (result) => {
//                 resolve({ url: result.url, id: result.public_id });
//             }, { resource_type: 'auto' }
//         );
//     });
// };

// const cloudinary = require('cloudinary').v2;
// const dotenv = require('dotenv');

// dotenv.config();
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET,
// });
// cloudinary.config({
//     cloud_name: process.env.CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })



// exports.uploads = (file, folder) => {
//     return new Promise((resolve) => {
//         cloudinary.uploader.upload(
//             file,
//             (result) => {
//                 resolve({
//                     url: result.url,
//                     id: result.public_id,
//                 });
//             }, {
//                 resource_type: 'auto',
//                 folder: folder,
//             }
//         );
//     });
// };
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// exports.uploads = (file, folder) => {
//     return new Promise(resolve => {
//         cloudinary.uploader.upload(file, (result) => {
//             resolve({
//                 url: result.url,
//                 id: result.public_id
//             })
//         }, {
//             resource_type: "auto",
//             folder: folder
//         })
//     })
// }

exports.uploads = (file, folder) => {
    return new Promise(resolve => {
        cloudinary.uploader.upload(file, (result) => {
            resolve({
                url: result.url,
                id: result.public_id
            })
        }, {
            resource_type: "auto",
            folder: folder
        })
    })
}