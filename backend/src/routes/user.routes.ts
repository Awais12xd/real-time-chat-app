import { Router } from "express";
import { z } from "zod";
import {
    toUserProfileResponse,
    UserProfile,
    UserProfileResponse,
} from "../modules/user/user.types.js";
import { getAuth } from "@clerk/express";
import { UnauthorizedError } from "../lib/errors.js";
import { getUserFromClerk, updateUserProfile } from "../modules/user/user.services.js";

export const userRouter = Router();

const userUpdateProfileSchema = z.object({
    displayName: z.string().trim().max(50).optional(),
    handle: z.string().trim().max(35).optional(),
    bio: z.string().trim().max(500).optional(),
    avatarUrl: z.url().optional(),
});

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
});

//update profile api

userRouter.patch("/update", async (req, res, next) => {
    try {
        const auth = getAuth(req);
        if (!auth.userId) {
            throw new UnauthorizedError("Unauthorized");
        }

        const parsedBody = userUpdateProfileSchema.parse(req.body);

        const displayName =
            parsedBody.displayName && parsedBody.displayName.trim().length > 0
                ? parsedBody.displayName?.trim()
                : null;
        const handle =
            parsedBody.handle && parsedBody.handle.trim().length > 0
                ? parsedBody.handle?.trim()
                : null;
        const bio =
            parsedBody.bio && parsedBody.bio.trim().length > 0
                ? parsedBody.bio?.trim()
                : null;
        const avatarUrl =
            parsedBody.avatarUrl && parsedBody.avatarUrl.trim().length > 0
                ? parsedBody.avatarUrl?.trim()
                : null;

        try {
            const profile = await updateUserProfile({
                clerkUserId : auth.userId,
                displayName,
                handle,
                bio,
                avatarUrl
            })

             const response = toResponse(profile);
             console.log("response", response)
             res.json({data:response})

        } catch (error) {
            throw error;
        } 
                

    } catch (error) {
         next(error)
     }
});
