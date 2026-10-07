import { Router } from "express";
import {
  webhookController,
  evaluationController,
} from "#src/controllers/evaluation.controllers.js";
import { verifyUserApiKey, verifyWebhookAuth } from "#src/middlewares/auth.js";

const router = Router();

router.post("/eval-webhook", verifyWebhookAuth, webhookController);
router.post("/evaluation", verifyUserApiKey, evaluationController);

export default router;
