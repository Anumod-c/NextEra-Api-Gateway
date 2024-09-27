import express from 'express';
import { orderController } from './orderController';

const orderRouter= express.Router();
orderRouter.post('/payment',orderController.makePayment)
orderRouter.post('/order',orderController.saveOrder)

export{orderRouter}