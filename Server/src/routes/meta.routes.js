import express from "express";
import { getCountriesMeta } from "../controllers/meta.controller.js";

const router = express.Router();

router.get("/countries", getCountriesMeta);

export default router;
