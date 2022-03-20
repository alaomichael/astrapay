const express = require('express');
const { Auth } = require('two-step-auth');

const twoStepAuth = async function login(emailId) {
    // const res = await Auth(emailId);
    // You can follw the above approach, But we recommend you to follow the one below, as the mails will be treated as important
    const res = await Auth(emailId, 'Pay-U');
    console.log(res);
    console.log(res.mail);
    console.log(res.OTP);
    console.log(res.success);
    return res;
};

// const app = express();
// app.get('./auth/mailId/CompanyName', async(req, res) => {
//     // const { emailId } = req.params;
//     const emailId = 'devmichaelalao@gmail.com';
//     const data = login(emailId);
//     console.log('email OTP response:', data);
// });
// twoStepAuth('devmichaelalao@gmail.com');
module.exports = twoStepAuth;