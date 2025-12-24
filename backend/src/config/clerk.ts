import type {Request , Response , NextFunction } from "express"
import { clerkMiddleware , getAuth, clerkClient } from "@clerk/express"
import { UnauthorizedError } from "../lib/errors.js";


export {clerkClient , clerkMiddleware , getAuth};


export function requireAuthApi(req : Request , _res : Response , next : NextFunction) : void {
    const auth = getAuth(req);

    if(!auth.userId){
        return next(new UnauthorizedError("You are not authorized for this resource!!"));
    };

    return next();
}