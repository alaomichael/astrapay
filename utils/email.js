// const express = require('express');
// const sendEmail = async(to, from, subject, text) => {
//     var API_KEY = '863f38600f59bbf47fdfb06aa67b9417-0d2e38f7-9bd0785e';
//     var DOMAIN = 'sandbox8a80e63bc0d04fd0b02dfc74e335d678.mailgun.org';
//     var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });
//     // from = 'PAY-U  <support@webpay-u.com>' || req.body.from;
//     const data = {
//         from: 'Excited User <me@samples.mailgun.org>',

//         to: 'devmichaelalao@gmail.com',
//         subject: 'testing email from mailgun',
//         text: 'testing email from mailgun',
//     };

//     return mailgun.messages().send(data, (error, body) => {
//         if (error) {
//             console.error(error);
//         } else {

// import * as express from 'express';
// import * as mailgunLoader from 'mailgun-js';
// const express = require('express');
// const router = express.Router();
const mailgunLoader = require('mailgun-js');
//             console.log(body);
//         }
//     });
// };
// module.exports = sendEmail;
// const express = require('express');

const dotenv = require('dotenv');
dotenv.config();
const sendEmail = async({ from, to, subject, text }) => {
    var API_KEY = process.env.MAILGUN_API_KEY;
    var DOMAIN = process.env.MAILGUN_DOMAIN;
    var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });
    from = 'PAY-U  <support@webpay-u.com>' || from;
    console.log('To From Email :', from);
    console.log('To Email :', to);

    // to = to.to;
    // subject = to.subject;
    // message = to.text;
    // message = message.toString();
    const data = {
        from: from,

        to: to,
        subject: subject,
        text: text
    };

    return mailgun.messages().send(data, (error, body) => {
        if (error) {
            console.error(error);
        } else {

            console.log(body);
        }
    });
};
module.exports = sendEmail;
// var API_KEY = '863f38600f59bbf47fdfb06aa67b9417-0d2e38f7-9bd0785e';
// var DOMAIN = 'sandbox8a80e63bc0d04fd0b02dfc74e335d678.mailgun.org';
// var mailgun = require('mailgun-js')({ apiKey: API_KEY, domain: DOMAIN });
// from = 'PAY-U  <support@webpay-u.com>'
// const data = {
//     from: from,
//     to: 'devmichaelalao@gmail.com',
//     subject: 'Hello',
//     text: 'Testing some Mailgun awesomeness!'
// };

// mailgun.messages().send(data, (error, body) => {
//     console.log(body);
// });