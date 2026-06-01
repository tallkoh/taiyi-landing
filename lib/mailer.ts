import nodemailer from 'nodemailer';

export function createTransport() {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

export const FROM = `Taiyi 太乙 <${process.env.GMAIL_USER}>`;
