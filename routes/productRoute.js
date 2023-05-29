import express from "express";
import {
  createProduct,
  createProductReview,
  deleteProduct,
  deleteReview,
  getAllProduct,
  getProductDetail,
  getProductReview,
  updateProduct,
} from "../controllers/productControllers.js";

import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";

const router = express.Router();

router.route("/products").get(getAllProduct);
router.route("/product/:id").get(getProductDetail);
router.route("/review").put(isAuthenticated, createProductReview);
router
  .route("/reviews")
  .get(getProductReview)
  .delete(isAuthenticated, deleteReview);

//create Product only by admin
router
  .route("/admin/product/new")
  .post(isAuthenticated, authorizeRoles("admin"), createProduct);

router
  .route("/admin/product/:id")
  .delete(isAuthenticated, authorizeRoles("admin"), deleteProduct)

  .put(isAuthenticated, authorizeRoles("admin"), updateProduct);

export default router;
