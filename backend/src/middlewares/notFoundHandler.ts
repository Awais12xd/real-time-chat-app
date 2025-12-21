import { NextFunction } from "express";


export function notFoundHandler(req : Request , res: Response, _next : NextFunction){
    _next()
}