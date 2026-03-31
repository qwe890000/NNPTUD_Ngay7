const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "8869c764279d0c",
        pass: "9e392fd8239034",
    },
});

module.exports = {
    sendMail: async function (to, url) {
        await transporter.sendMail({
            from: 'admin@haha.com',
            to: to,
            subject: "reset password email",
            text: "click vao day de doi pass", // Plain-text version of the message
            html: "click vao <a href=" + url+ ">day</a> de doi pass", // HTML version of the message
        })
    },
    sendPasswordMail: async function (to, username, password) {
        await transporter.sendMail({
            from: 'admin@haha.com',
            to: to,
            subject: "Your New Account Information",
            text: `Hello ${username},\n\nYour account has been created. Your password is: ${password}\n\nPlease keep it safe.`,
            html: `<p>Hello <b>${username}</b>,</p><p>Your account has been created.</p><p>Your password is: <b>${password}</b></p><p>Please keep it safe.</p>`
        })
    }
}

// Send an email using async/await
