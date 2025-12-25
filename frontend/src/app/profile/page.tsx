"use client";

import { apiGet, craeteBrowserApiClient } from "@/lib/api-client";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const optionText = z
  .string()
  .transform((value) => value.trim())
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const ProfileSchema = z.object({
  displayName: optionText,
  bio: optionText,
  handle: optionText,
  avatarUrl: optionText,
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

type UserResponse = {
  id: number;
  clerkUserId: string;
  displayName: string | null;
  email: string | null;
  bio: string | null;
  handle: string | null;
  avatarUrl: string | null;
};

function ProfilePage() {
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const apiClient = useMemo(() => craeteBrowserApiClient(getToken), [getToken]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: "",
      handle: "",
      bio: "",
      avatarUrl: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setIsLoading(true);
        const getUserInfo = await apiGet<UserResponse>(apiClient, "/api/me");
        if (!isMounted) {
          return;
        }

        console.log("getUserInfo" , getUserInfo )

        form.reset({
            displayName : getUserInfo.displayName ?? "",
            handle : getUserInfo.handle ?? "",
            bio : getUserInfo.bio ?? "",
            avatarUrl : getUserInfo.avatarUrl ?? "",

        })
      } catch (error: any) {
        console.log(error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();
  }, [apiClient, form]);

  return <div>Profile Page</div>;
}

export default ProfilePage;
