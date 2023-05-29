import { catchAsyncError } from "../middleware/catchAsyncError.js";
import ErrorHandler from "../util/Errorhandler.js";
import { User } from "../models/userModel.js";
import { sendToken } from "../util/sendToken.js";
import crypto from "crypto";
import { sendEmail } from "../util/sendEmail.js";

//register user
export const Register = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;
  console.log(name);

  ///////////////////////////////////////////  I did not use multer, cloudinary to store image on cloud but i simulated how its work (public_id and url)  /////////////////////

  // const file = req.file;

  // if (!name || !email || !password || !file)

  if (!name || !email || !password)
    return next(new ErrorHandler("Please enter all field", 400));

  let user = await User.findOne({ email });

  if (user) return next(new ErrorHandler("User Already Exist", 409));

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "lkjhbgvbnm",
      url: "kjhgfcvhjkl",
    },
  });

  sendToken(res, user, "register successfully", 201);
});

//login user

export const Login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("please enter all field", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Incorrect Email or Password", 401));

  const isMatch = await user.comparePassword(password);

  if (!isMatch)
    return next(new ErrorHandler("Incorrect Email or Password", 401));

  sendToken(res, user, `Welcome back ${user.name}`, 200);
});

//logout handler

export const Logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "Logout Successfully",
  });
});

//getAllProfile

export const getUserDetail = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    user,
    success: true,
  });
});

export const changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new ErrorHandler("please enter all field", 400));
  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.comparePassword(oldPassword);

  if (!isMatch) return next(new ErrorHandler("Incorrect Old Password", 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    message: "Password change successfully",
    success: true,
  });
});

//update Profile

export const updateProfile = catchAsyncError(async (req, res, next) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();
  res.status(200).json({
    success: true,
    user,
  });
});

//forgot password

export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return next(new ErrorHandler("User not found", 400));

  const resetToken = await user.getResetToken();

  await user.save();

  const url = `${process.env.BACKEND_URL}/resetpassword/${resetToken}`;

  const message = `Click on link to reset your Password. ${url}. If you have then Ignore`;

  await sendEmail(user.email, "Ecomm Reset Password", message);
  res.status(200).json({
    success: true,
    message: `Reset Token has been send to ${user.email}`,
  });
});

//Reset Password
export const resetPassword = catchAsyncError(async (req, res, next) => {
  const { token } = req.params;

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });
  if (!user)
    return next(new ErrorHandler("Token is invalid or has been expire"));

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Password change successfully",
    token,
  });
});

//get All user by admin
export const getAllUser = catchAsyncError(async (req, res, next) => {
  const user = await User.find({});

  res.status(200).json({
    success: true,
    message: "users",
    user,
  });
});

// Get Single User (Admin)

export const getSingleUser = catchAsyncError(async (req, res, next) => {
  const { id } = req.params;
  console.log(id);

  const user = await User.findById(id);
  console.log(user);

  if (!user)
    return next(
      new ErrorHandler(`User account is not exist with this Id: ${id}`, 400)
    );

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user role by Admin

export const updateProfileRole = catchAsyncError(async (req, res, next) => {
  const { name, email, role } = req.body;

  let user = await User.findById(req.params.id);

  (user.name = name), (user.email = email), (user.role = role);

  console.log(user);
  user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

//Delete user role by Admin

export const deleteUser = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.params.id);

  if (!user)
    return next(
      new ErrorHandler(`user does not exist with Id: ${req.params.id}`, 400)
    );

  await user.remove();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});
