import express from 'express'
import { addProduct } from '../controllers/productController.js'
import authUser from '../middleware/auth.js'
import { addToCart, getUserCart, updateCart } from '../controllers/cartController.js'

const cartRouter = express.Router()

cartRouter.post('/get', authUser, getUserCart)
cartRouter.post('/add', authUser, addToCart)
cartRouter.post('/update', authUser, updateCart)

export default cartRouter;