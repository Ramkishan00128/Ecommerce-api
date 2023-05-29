import express from "express";
import {
  changePassword,
  deleteUser,
  forgotPassword,
  getAllUser,
  getSingleUser,
  getUserDetail,
  Login,
  Logout,
  Register,
  resetPassword,
  updateProfile,
  updateProfileRole,
} from "../controllers/userController.js";
import { authorizeRoles, isAuthenticated } from "../middleware/auth.js";
const router = express.Router();

router.route("/register").post(Register);

router.route("/login").post(Login);

router.route("/password/forgot").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/logout").get(Logout);

router.route("/me").get(isAuthenticated, getUserDetail);

router.route("/password/update").post(isAuthenticated, changePassword);

router.route("/profile/update").post(isAuthenticated, updateProfile);

/////////////////////////////////////////////////// For Admin Route Email password /////////////////////////////////////////
// email:admin @gmail.com
// password:12345678

//Admin Route

router
  .route("/admin/user")
  .get(isAuthenticated, authorizeRoles("admin"), getAllUser);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticated, authorizeRoles("admin"), updateProfileRole)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);

export default router;
