import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

const transporter = nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: { user: env.email.user, pass: env.email.pass },
});

async function sendWithRetry(options: nodemailer.SendMailOptions, retries = 3): Promise<void> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            await transporter.sendMail(options);
            return;
        } catch (err) {
            logger.warn(`Email send attempt ${attempt} failed`, { error: err, to: options.to });
            if (attempt === retries) throw err;
            await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000)); // exponential backoff
        }
    }
}

export const EmailService = {
    async sendComplaintReceived(to: string, name: string, ticketNumber: string, title: string) {
        await sendWithRetry({
            from: env.email.from,
            to,
            subject: `Complaint Received — ${ticketNumber}`,
            html: `
        <h2>Hello ${name},</h2>
        <p>Your complaint <strong>"${title}"</strong> has been received.</p>
        <p>Ticket Number: <strong>${ticketNumber}</strong></p>
        <p>Our team will review and respond shortly.</p>
        <br/><p>— ASTU Complaint System</p>
      `,
        }).catch((e) => logger.error('Email failed', { error: e }));
    },

    async sendStatusUpdate(to: string, name: string, ticketNumber: string, status: string) {
        await sendWithRetry({
            from: env.email.from,
            to,
            subject: `Ticket ${ticketNumber} — Status Updated`,
            html: `
        <h2>Hello ${name},</h2>
        <p>Your complaint (${ticketNumber}) status has been updated to: <strong>${status.toUpperCase()}</strong></p>
        <br/><p>— ASTU Complaint System</p>
      `,
        }).catch((e) => logger.error('Email failed', { error: e }));
    },

    async sendWelcome(to: string, name: string, tempPassword?: string) {
        await sendWithRetry({
            from: env.email.from,
            to,
            subject: 'Welcome to ASTU Complaint System',
            html: `
        <h2>Hello ${name},</h2>
        <p>Your staff account has been created on the ASTU Complaint & Issue Tracking System.</p>
        ${tempPassword ? `<p>Temporary Password: <strong>${tempPassword}</strong></p><p>Please change it immediately after login.</p>` : ''}
        <br/><p>— ASTU Admin</p>
      `,
        }).catch((e) => logger.error('Email failed', { error: e }));
    },
};
