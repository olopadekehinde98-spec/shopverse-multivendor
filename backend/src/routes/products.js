const router = require('express').Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, uploadProductImage, getSellerProducts, getCategories,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/my', protect, authorize('seller'), getSellerProducts);
router.get('/:id', getProduct);

router.post('/', protect, authorize('seller'), createProduct);
router.post('/upload-image', protect, authorize('seller'), upload.single('image'), uploadProductImage);
router.put('/:id', protect, authorize('seller'), updateProduct);
router.delete('/:id', protect, authorize('seller'), deleteProduct);

module.exports = router;
