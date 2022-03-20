// To generate pdf using pdfkit

const PDFDocument = require('pdfkit');
const fs = require('fs');

let pdfDoc = new PDFDocument;
// pdfDoc.pipe(fs.createWriteStream('SampleDocument.pdf'));
// pdfDoc.text("My Sample PDF Document");
// pdfDoc.end();



// module.exports = convertJsonToPdf;
let convertJsonToPdf = async({ filename }) => {
    let fname = filename + '.pdf';
    pdfDoc.pipe(fs.createWriteStream(fname));
    pdfDoc.text("My Sample PDF Document");
    pdfDoc.end()
};



module.exports = convertJsonToPdf;