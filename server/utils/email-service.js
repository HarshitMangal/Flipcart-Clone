import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendOTP = async (email, otp) => {
    // Development fallback if email credentials are not set in .env
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n==================================================');
        console.log(`⚠️  [DEV MODE] SMTP Email credentials missing in .env`);
        console.log(`✉️  Mock sending verification code to: ${email}`);
        console.log(`🔑 [OTP CODE] Your verification code is: ${otp}`);
        console.log('==================================================\n');
        return true; 
    }

    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'ShopSphere Verification OTP',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #2874f0; text-align: center;">Welcome to ShopSphere!</h2>
                    <p>Hello,</p>
                    <p>Your OTP for verification is:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; background: #f1f3f6; padding: 10px 20px; border-radius: 4px; letter-spacing: 5px;">${otp}</span>
                    </div>
                    <p>This OTP is valid for 10 minutes. Please do not share it with anyone.</p>
                    <p>Thanks,<br>ShopSphere Team</p>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
