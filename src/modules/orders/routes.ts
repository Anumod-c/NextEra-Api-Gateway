import express from 'express';
import { orderController } from './orderController';
import authenticateToken from '../../middleware/authMiddleware';
import { userIsBlocked } from '../../middleware/IsBlockedMiddleware';

const orderRouter = express.Router();
orderRouter.post('/payment', authenticateToken(["user"]),userIsBlocked, orderController.makePayment)
orderRouter.post('/order', authenticateToken(["user"]),userIsBlocked, orderController.saveOrder)

export { orderRouter }