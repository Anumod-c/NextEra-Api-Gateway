// src/types/express/index.d.ts
import express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any; // or define the exact shape of the user object if needed
    }
  }
}
