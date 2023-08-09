import express from "express";
import { sendMail } from "../controllers/mailcontrollers";

const router = express.Router();

router.route("/").post(sendMail);

export default router;
