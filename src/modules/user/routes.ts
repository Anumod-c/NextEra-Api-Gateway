import  express  from "express"
import { userController } from "./userController";
import { userIsBlocked } from "../../middleware/IsBlockedMiddleware";
import authenticateToken from "../../middleware/authMiddleware";
const userRouter = express.Router();

userRouter.post('/register',userController.register)
userRouter.post('/otp',userController.otp)
userRouter.post('/login',userController.login)
userRouter.post('/forgotPassword',userController.forgotPassword)
userRouter.post('/resendOtp',userController.resendOtp)
userRouter.post('/resetPassword',userController.resetPassword)
userRouter.post('/google_login',userController.googleLogin)
userRouter.post('/editProfile',authenticateToken(['user']),userIsBlocked ,userController.editProfile)
userRouter.get('/get-presigned-url',userController.getPresignedUrlForUpload)
userRouter.put('/updateProfilePicture',userIsBlocked ,userController.updateProfilePicture)
userRouter.post('/add_reviews',authenticateToken(['user']),userIsBlocked ,userController.addReviews)
userRouter.get('/fetchReviews/:courseId',userIsBlocked ,userController.fetchReviews)

userRouter.post('/refresh-token',userController.refreshToken)


export {userRouter}