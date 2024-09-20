import express,{Router} from 'express';
import { courseController } from './courseController';

const courseRouter = express.Router();
courseRouter.post('/addCourse',courseController.AddCourse)
courseRouter.get('/fetchAllCourse',courseController.fetchAllCourse)
courseRouter.get('/fetchAllCourse/:courseId',courseController.singleCourse)




export {courseRouter}