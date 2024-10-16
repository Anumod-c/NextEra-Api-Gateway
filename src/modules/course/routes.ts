import express,{Router} from 'express';
import { courseController } from './courseController';
import authenticateToken from '../../middleware/authMiddleware';
import { userIsBlocked } from '../../middleware/IsBlockedMiddleware';

const courseRouter = express.Router();
courseRouter.post('/addCourse',courseController.AddCourse)
courseRouter.get('/fetchAllCourses',courseController.fetchAllCourse)
courseRouter.get('/fetchAllCourses/:courseId', courseController.singleCourse)
courseRouter.get('/fetchLatestCourses',courseController.fetchLatestcourses)
courseRouter.post('/fetchMyCourses', userIsBlocked,courseController.fetchMyCourses)




export {courseRouter}