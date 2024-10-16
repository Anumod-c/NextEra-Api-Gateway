import  express  from "express"
import { userController } from "./userController";
import { userIsBlocked } from "../../middleware/IsBlockedMiddleware";

const userRouter = express.Router();

userRouter.post('/register',userController.register)
userRouter.post('/otp',userController.otp)
userRouter.post('/login',userController.login)
userRouter.post('/forgotPassword',userController.forgotPassword)
userRouter.post('/resendOtp',userController.resendOtp)
userRouter.post('/resetPassword',userController.resetPassword)
userRouter.post('/google_login',userController.googleLogin)
userRouter.post('/editProfile',userIsBlocked ,userController.editProfile)
userRouter.get('/get-presigned-url',userController.getPresignedUrlForUpload)
userRouter.put('/updateProfilePicture',userIsBlocked ,userController.updateProfilePicture)
// userRouter.post('/refreshToken',userController.refreshToken)


export {userRouter}