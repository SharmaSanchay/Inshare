const nodemailer = require("nodemailer");

async function sendMail({ from, to, subject, text, html }) {
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // Use true for 465, false for other ports
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    try {
        let info = await transporter.sendMail({
            from: `inShare <${from}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        });

        console.log("Message sent: %s", info.messageId);
        return info; // Optionally return the info object
    } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Could not send email");
    }
}

module.exports = sendMail;
