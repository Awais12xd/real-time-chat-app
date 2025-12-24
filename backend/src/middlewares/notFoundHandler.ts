import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../lib/errors.js";


export function notFoundHandler(_req : Request , _res: Response, _next : NextFunction){
    _next(new NotFoundError("Route not found"))
}