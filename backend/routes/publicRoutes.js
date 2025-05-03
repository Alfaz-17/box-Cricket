import express from "express";
import { getAllBoxes ,getBoxDetails} from "../controllers/publicController.js";

const router = express.Router();

router.get("/boxes", getAllBoxes);           // List all cricket boxes
router.get("/boxes/:id",getBoxDetails);     // Box details by ID

export default router;
