import express,{Router} from 'express';
import { courseController } from './courseController';
import authenticateToken from '../../middleware/authMiddleware';
import { userIsBlocked } from '../../middleware/IsBlockedMiddleware';

const courseRouter = express.Router();
courseRouter.post('/addCourse',courseController.AddCourse)
courseRouter.get('/fetchAllCourses',courseController.fetchAllCourse)
courseRouter.get('/fetchAllCourses/:courseId', courseController.singleCourse)
courseRouter.get('/fetchLatestCourses',courseController.fetchLatestcourses)
courseRouter.get('/fetchMostRatedCourse',courseController.fetchMostRatedCourse)

courseRouter.post('/fetchMyCourses', userIsBlocked,courseController.fetchMyCourses)
courseRouter.get('/fetchCourseChatList', userIsBlocked,courseController.fetchCourseChatList)




export {courseRouter}