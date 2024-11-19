import express,{Router} from 'express';
import { courseController } from './courseController';
import authenticateToken from '../../middleware/authMiddleware';
import { isTutorBlocked, userIsBlocked } from '../../middleware/IsBlockedMiddleware';

const courseRouter = express.Router();
courseRouter.post('/addCourse',isTutorBlocked,courseController.AddCourse)
courseRouter.get('/fetchAllCourses',courseController.fetchAllCourse)
courseRouter.get('/fetchAllCourses/:courseId', courseController.singleCourse)
courseRouter.get('/fetchLatestCourses',courseController.fetchLatestcourses)
courseRouter.get('/fetchMostRatedCourse',courseController.fetchMostRatedCourse)
courseRouter.get('/fetchMostPurchasedCourse',courseController.fetchMostPurchasedCourse)

courseRouter.post('/fetchMyCourses',authenticateToken(['user']), userIsBlocked,courseController.fetchMyCourses)
courseRouter.get('/fetchCourseChatList',authenticateToken(['user']), userIsBlocked,courseController.fetchCourseChatList)




export {courseRouter}