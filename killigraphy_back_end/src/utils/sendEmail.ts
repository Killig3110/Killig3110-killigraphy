import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, text: string) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `Killigraphy <${process.env.GMAIL_USER}>`,
        to,
        subject,
        text,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.response);
    } catch (err) {
        console.error('Failed to send email:', err);
        throw err;
    }
};
