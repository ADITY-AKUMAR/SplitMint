import express from "express";
import {
  createGroup,
  getGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addParticipant,
  removeParticipant,
  updateParticipant,
} from "../controllers/groupController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", createGroup);
router.get("/", getGroups);
router.get("/:id", getGroup);
router.put("/:id", updateGroup);
router.delete("/:id", deleteGroup);

router.post("/:id/participants", addParticipant);
router.delete("/:id/participants", removeParticipant);
router.put("/:id/participants", updateParticipant);

export default router;
