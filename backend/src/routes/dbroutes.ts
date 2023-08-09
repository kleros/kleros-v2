import express from "express";
import { createUser, getUser, updateUser } from "../controllers/dbcontrollers";

const router = express.Router();

router.route("/").post(createUser).get(getUser);
router.route("/:walletaddress").put(updateUser);

export default router;
