import express from "express";
import routes from "#src/routes/evaluation.routes.js";
import { errorMiddleware } from "#src/middlewares/error.middleware.js";
import { notFoundMiddleware } from "#src/middlewares/not-found.middleware.js";

const app = express();

app.use(express.json());

app.use("/api", routes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);

export default app;
