import { Router } from 'express';
import {
  getProducts, createProduct, updateProduct, deleteProduct,
} from '../controllers/products';
import auth from '../middlewares/auth';
import {
  validateProductBody, validateProductUpdate, validateProductId,
} from '../middlewares/validations';

const router = Router();

router.get('/', getProducts);
router.post('/', auth, validateProductBody, createProduct);
router.patch('/:productId', auth, validateProductUpdate, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);

export default router;
