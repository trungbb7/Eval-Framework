import { Router } from "express";
import {
  webhookController,
  evaluationController,
} from "#src/controllers/evaluation.controllers.js";
import {
  verifyUserApiKey,
  verifyWebhookAuth,
} from "#src/middlewares/auth.middleware.js";

const router = Router();

router.post("/eval-webhook", verifyWebhookAuth, webhookController);
router.post("/evaluate", verifyUserApiKey, evaluationController);

export default router;
