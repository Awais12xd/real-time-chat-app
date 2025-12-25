import { Router } from "express";
import { z } from "zod";
import { toUserProfileResponse, UserProfile, UserProfileResponse } from "../modules/user/user.types.js";
import { getAuth } from "@clerk/express";
import { UnauthorizedError } from "../lib/errors.js";
import { getUserFromClerk } from "../modules/user/user.services.js";


export const userRouter = Router();

const userUpdateProfileSchema = z.object({
    displayName: z.string().trim().max(50).optional(),
    handle: z.string().trim().max(35).optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: z.url().optional(),
})

function toResponse(profile: UserProfile): UserProfileResponse {
    return toUserProfileResponse(profile);
}


//get profile api 
userRouter.get("/", async (req, res, next) => {
    try {
        const auth = getAuth(req);
        if (!auth.userId) {
            throw new UnauthorizedError("Unauthorized");
        }
        const profile = await getUserFromClerk(auth.userId);
        const response = toResponse(profile);

        res.json({ data: response });
    } catch (error) {
        next(error);
    }
})


//update profile api

userRouter.patch("/", async (req, res, next) => {
    try {
        const auth = getAuth(req);
        if (!auth.userId) {
            throw new UnauthorizedError("Unauthorized");
        }
    } catch (error) {

    }
})
