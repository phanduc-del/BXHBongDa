import express from "express";
import { addMatch } from "../controllers/matchController.js";

const router = express.Router();

router.post("/", addMatch);

export default router;
