import expres, { Request, Response } from "express";
import tutorRabbitMqClient from "../tutor/rabbitMQ.ts/client";
import userRabbitMqClient from "../user/rabbitMQ/client";
import courseRabbitMqClient from "./rabbitMQ/client";

export const courseController = {
  AddCourse: async (req: Request, res: Response) => {
    try {
      console.log("data form addcourse1", req.body);
      const data = req.body;
      const operation = "AddCourse";
      const result: any = await courseRabbitMqClient.produce(data, operation);
      console.log("Produced from apigateway course controller");

      return res.json(result);
    } catch (error) {
      console.log("error in addcourse", error);
    }
  },
  fetchAllCourse: async (req: Request, res: Response) => {
    try {
      const operation = "fetchAllCourse";
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const { search, category, level, sort } = req.query;
      const filterOptions = {
        search: search || "",
        category: category || null,
        level: level || null,
        sort: sort || null,
        page: page,
        limit: limit,
      };
      console.log(search, "reached fetched course");

      const result: any = await courseRabbitMqClient.produce(
        filterOptions,
        operation
      );
      const { courses, totalPages, currentPage, success } = result;
      console.log("result", result.totalPages);
      console.log("hyyy");
      if (success && courses.length > 0) {
        const coursesWithTutors = await Promise.all(
          result.courses.map(async (course: any) => {
            const tutorId = course.tutorId;
            const tutorDetails = await tutorRabbitMqClient.produce(
              tutorId,
              "fetchTutorById"
            );

            return {
              ...course,
              tutorDetails: tutorDetails ? tutorDetails : null,
            };
          })
        );
        return res.json({
          success: true,
          message: "Courses fetched successfully with tutor details",
          courses: coursesWithTutors,
          totalPages, // Include totalPages in response
          currentPage, // Include currentPage in response
        });
      }
      return res.json({
        success: false,
        message: "No courses found",
      });
    } catch (error) {
      console.log("error in fetching all course", error);
    }
  },
  singleCourse: async (req: Request, res: Response) => {
    try {
      const { courseId } = req.params;
      const { userId } = req.query;
      const operation = "singleCourse";

      console.log("couseidddd", courseId);

      const courseResult: any = await courseRabbitMqClient.produce(
        courseId,
        operation
      );

      if (!courseResult.success) {
        return res.status(404).json({ message: "Course not found" });
      }

      console.log("resulteeee", courseResult);

      const course = courseResult.course;
      const tutorId = course.tutorId;

      // Fetch tutor details using tutorId
      const tutorOperation = "fetchTutorById";
      const tutorResult: any = await tutorRabbitMqClient.produce(
        tutorId,
        tutorOperation
      );

      if (!tutorResult.success) {
        return res.status(404).json({ message: "Tutor not found" });
      }

      console.log("datass", tutorResult);

      const tutor = tutorResult.tutorDetails;

      // Fetch user details from the user service to check purchased courses
      const userOperation = "getUserDetails";
      if (userId) {
        const userResult: any = await userRabbitMqClient.produce(
          userId,
          userOperation
        );
        console.log("userreslt", userResult);
        const hasPurchased =
          userResult.user.purchasedCourses.includes(courseId);
        console.log("course purchased", hasPurchased);
        const result = {
          success: true,
          message: "Single Course and Tutor fetched successfully",
          course,
          tutor,
          hasPurchased,
        };
        return res.json(result);
      }
      const result = {
        success: true,
        message: "Single Course and Tutor fetched successfully",
        course,
        tutor,
      };
      return res.json(result);

      // Combine course and tutor data
    } catch (error) {
      console.log("Error in showing singlecourse page", error);
    }
  },

  fetchLatestcourses: async (req: Request, res: Response) => {
    try {
      const operation = "fetchLatestCourses";
      console.log("reached fetched Latest course");

      const result: any = await courseRabbitMqClient.produce({}, operation);
      console.log(" latest result", result);
      console.log("hyyy");
      if (result.success && result.courses.length > 0) {
        const coursesWithTutors = await Promise.all(
          result.courses.map(async (course: any) => {
            const tutorId = course.tutorId;
            const tutorDetails = await tutorRabbitMqClient.produce(
              tutorId,
              "fetchTutorById"
            );

            return {
              ...course,
              tutorDetails: tutorDetails ? tutorDetails : null,
            };
          })
        );
        return res.json({
          success: true,
          message: "Latest Courses fetched successfully with tutor details",
          courses: coursesWithTutors,
        });
      }
      return res.json({
        success: false,
        message: "No courses found",
      });
    } catch (error) {
      console.log("error in fetching Latest course", error);
    }
  },
  fetchMostRatedCourse: async (req: Request, res: Response) => {
    try {
      const operation = "fetchMostRatedCourse";
      console.log("reached  fetchMostRatedCourse course");

      const result: any = await courseRabbitMqClient.produce({}, operation);
      console.log(" fetchMostRatedCourse result", result);
      console.log("fetchMostRatedCourse");
      if (result.success && result.courses.length > 0) {
        const coursesWithTutors = await Promise.all(
          result.courses.map(async (course: any) => {
            const tutorId = course.tutorId;
            const tutorDetails = await tutorRabbitMqClient.produce(
              tutorId,
              "fetchTutorById"
            );

            return {
              ...course,
              tutorDetails: tutorDetails ? tutorDetails : null,
            };
          })
        );
        return res.json({
          success: true,
          message:
            "fetchMostRatedCourse Courses fetched successfully with tutor details",
          courses: coursesWithTutors,
        });
      }
      return res.json({
        success: false,
        message: "No courses found",
      });
    } catch (error) {
      console.log("error in fetching Latest course", error);
    }
  },
  fetchMyCourses: async (req: Request, res: Response) => {
    try {
      console.log(req.body);
      const enrolledCourses = req.body;
      const operation = "fetchMyCourses";
      const result: any = await courseRabbitMqClient.produce(
        enrolledCourses,
        operation
      );

      if (result.success && result.courses.length > 0) {
        const coursesWithTutors = await Promise.all(
          result.courses.map(async (course: any) => {
            const tutorId = course.tutorId;
            const tutorDetails = await tutorRabbitMqClient.produce(
              tutorId,
              "fetchTutorById"
            );

            return {
              ...course,
              tutorDetails: tutorDetails ? tutorDetails : null,
            };
          })
        );
        return res.json({
          success: true,
          message: "Latest Courses fetched successfully with tutor details",
          courses: coursesWithTutors,
        });
      }
      return res.json({
        success: false,
        message: "No courses found",
      });
    } catch (error) {
      console.error("Error  fetching my courses", error);
      return res.json({ error: "Could not fetch my courses" });
    }
  },

  fetchCourseChatList: async (req: Request, res: Response) => {
    try {
      const userId = req.query.currentUserId;
      console.log(userId, "userId");
      const operation = "fetchCourseChatList";
      const result: any = await courseRabbitMqClient.produce(userId, operation);
      return res.json(result);
    } catch (error) {
      console.log("Error in listing puchased course for chat list", error);
    }
  },
};
