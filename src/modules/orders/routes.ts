import express from 'express';
import { orderController } from './orderController';
import authenticateToken from '../../middleware/authMiddleware';

const orderRouter = express.Router();
orderRouter.post('/payment', authenticateToken(["user"]), orderController.makePayment)
orderRouter.post('/order', authenticateToken(["user"]), orderController.saveOrder)

export { orderRouter }