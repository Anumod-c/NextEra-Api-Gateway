import express,{Router} from 'express';
import { courseController } from './courseController';

const courseRouter = express.Router();
courseRouter.post('/addCourse',courseController.AddCourse1)



export {courseRouter}