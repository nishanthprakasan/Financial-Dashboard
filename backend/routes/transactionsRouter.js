import { Router } from "express";
import transactionControllers from "../controllers/transactions.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

const {
  handleFetchTransaction,
  handleAddTransaction,
  handleEditTransaction,
  handleDeleteTransaction,
  handleExportTransaction,
} = transactionControllers;

router.use(authMiddleware);

router.route("/").get(handleFetchTransaction).post(handleAddTransaction);
router
  .route("/:id")
  .patch(handleEditTransaction)
  .delete(handleDeleteTransaction);

router.get("/export", handleExportTransaction);
export default router;
