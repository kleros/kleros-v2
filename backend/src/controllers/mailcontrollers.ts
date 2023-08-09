import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Replace with your email provider",
  auth: {
    user: "Replace with username",
    pass: "Replace with password",
  },
});

const sendMail = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const { to, subject, text } = req.body;

    await transporter.sendMail({
      from: "Replace with your email address",
      to,
      subject,
      text,
    });

    res.json({ message: "Email sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while sending the email" });
  }
});

export { sendMail };
