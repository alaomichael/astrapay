//  To generate excel file
const XLSX = require('xlsx');

//seed data;

// const data = [
//     { name: "Michael", email: "testing@emial.com", phone: 2347033680599 },
//     { name: "Trace", email: "testing2@emial.com", phone: 2347033680600 },
//     { name: "Media", email: "testing3@emial.com", phone: 2347033680601 }
// ]

// get the current date
let d = new Date();

// add the current year_month_date_hours_minutes_seconds to the filename
let file_output_name = d.getFullYear() + "_" + (d.getMonth() + 1) + "_" + d.getDate() + "_" + d.getHours() + "_" + d.getMinutes() + "_" + d.getSeconds() + "_claim.xlsx";

const convertJsonToExcel = async(data) => {
    const workSheet = XLSX.utils.json_to_sheet(data);
    const workBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workBook, workSheet, "sheet");

    // Generate buffer
    XLSX.write(workBook, { bookType: 'xlsx', type: "buffer" });

    // Binary string
    XLSX.write(workBook, { bookType: "xlsx", type: "binary" });

    XLSX.writeFile(workBook, file_output_name);
}

// convertJsonToExcel(file_output_name, data);

module.exports = convertJsonToExcel;