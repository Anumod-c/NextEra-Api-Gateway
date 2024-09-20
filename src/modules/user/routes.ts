import  express  from "express"
import { userController } from "./userController";
import authenticateToken from "../../middleware/user/authMiddleware";

const userRouter = express.Router();

userRouter.post('/register',userController.register)
userRouter.get('/refresh-token',userController.refreshToken)
userRouter.post('/otp',userController.otp)
userRouter.post('/login',userController.login)
userRouter.post('/forgotPassword',userController.forgotPassword)
userRouter.post('/resendOtp',userController.resendOtp)
userRouter.post('/resetPassword',userController.resetPassword)
userRouter.post('/google_login',userController.googleLogin)
export {userRouter}