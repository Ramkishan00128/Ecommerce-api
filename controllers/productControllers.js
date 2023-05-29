import { catchAsyncError } from "../middleware/catchAsyncError.js";
import { Product } from "../models/productModel.js";
import { ApiFeatures } from "../util/ApiFeatures.js";
import ErrorHandler from "../util/Errorhandler.js";

// create Product
export const createProduct = catchAsyncError(async (req, res, next) => {
  req.body.user = req.user.id;

  let product = req.body;
  product = await Product.create(product);

  res.status(201).json({
    success: true,
    product,
  });
});

export const getAllProduct = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apiFeatures = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const product = await apiFeatures.query;

  res.status(200).json({
    success: true,
    product,
    productCount,
  });
});

//Get Product detail
export const getProductDetail = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product is not found", 404));

  res.status(200).json({
    success: true,
    product,
  });
});

//Update product by admin

export const updateProduct = catchAsyncError(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not found", 404));
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  product.save();
  res.status(200).json({
    success: true,
    product,
  });
});

export const deleteProduct = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new ErrorHandler("Product not Found", 404));

  await product.remove();
  res.status(200).json({
    success: true,
    message: "Product is deleted",
  });
});

//Create Review
export const createProductReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user.id,
    name: req.user.name,
    rating,
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfRevies = product.reviews.length;
  }
  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    product,
  });
});

//Get All Review of a Product

export const getProductReview = catchAsyncError(async (req, res, next) => {
  const { id } = req.query;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

//Delete Reviews

export const deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) return next(new ErrorHandler("Product not found", 404));

  let reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  console.log(reviews);

  let avg = 0;
  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = avg / reviews.length;

  let numOfRevies = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfRevies,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});
