import { safeCompare } from "#src/utils/cryptoUtil.js";

/**
 * 1. Webhook auth middleware
 */
export const verifyWebhookAuth = (req, res, next) => {
  const incomingSecret = req.headers["x-webhook-secret"];
  const expectedSecret = process.env.WEBHOOK_SECRET;
  if (!expectedSecret) {
    console.error("[Auth Error] WEBHOOK_SECRET haven't configuraged in .env");
    return res
      .status(500)
      .json({ error: "Server authentication misconfigured" });
  }
  if (!incomingSecret || !safeCompare(incomingSecret, expectedSecret)) {
    console.warn(`[Auth] Incorrect secret from request IP: ${req.ip}`);
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or missing Webhook Secret" });
  }
  next();
};
/**
 * 2. User auth middleware
 */
export const verifyUserApiKey = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error:
        "Unauthorized: Missing Authorization header (Format: Bearer <API_KEY>)",
    });
  }
  const token = authHeader.split(" ")[1];
  const allowedKeys = (process.env.ALLOWED_API_KEYS || "")
    .split(",")
    .map((k) => k.trim());
  const matchedKey = allowedKeys.find((key) => safeCompare(token, key));
  if (!matchedKey) {
    console.warn(
      `[Auth] API Key không hợp lệ: ${token.slice(0, 8)}... từ IP: ${req.ip}`,
    );
    return res.status(403).json({ error: "Forbidden: Invalid API Key" });
  }

  req.callerKey = matchedKey;
  console.log(
    `[Auth] Xác thực thành công cho caller: ${matchedKey.slice(0, 15)}...`,
  );
  next();
};
