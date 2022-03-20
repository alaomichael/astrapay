var request = require('request');
var data = {
    api_key: 'TLjTqSHdIYJh48YT4flzTqIlq4M59Pcht0CSsy8SHkJcVnmrtUmvMoiPk0QSvc',
    message_type: 'NUMERIC',
    to: '2347033680599',
    from: 'Pay_U',
    channel: 'dnd',
    pin_attempts: 10,
    pin_time_to_live: 5,
    pin_length: 6,
    pin_placeholder: '< 1234 >',
    message_text: `  Dear {Firstname} ,

Thanks for signing up to Pay-U!  We're really glad to have you onboard


I’m Temi, the founder of PAY-U and I’d like to personally thank you for signing up to our service. We established PAY-U  in order to provide you with affordable and transparent vehicle insurance. Please enjoy our service to the fullest. 

I’d love to hear what you think of  PAY-U and if there is anything we can improve. If you have any questions, please reply to this email. 
Your pin is < 1234 >
I’m always happy to help!

Enjoy! 


Temi from Pay-U 
`,
    pin_type: 'NUMERIC',
};
var options = {
    method: 'POST',
    url: 'https://termii.com/api/sms/otp/send',
    headers: {
        'Content-Type': ['application/json', 'application/json'],
    },
    body: JSON.stringify(data),
};
request(options, function(error, response) {
    if (error) throw new Error(error);
    console.log(response.body);
});