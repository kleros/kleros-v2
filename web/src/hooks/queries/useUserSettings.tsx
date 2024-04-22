import { useQuery } from "@tanstack/react-query";

import { isUndefined } from "utils/index";

export const useUserSettings = () => {
  const authToken = sessionStorage.getItem("auth-token")?.replace(/"/g, "");
  const isEnabled = !isUndefined(authToken);

  return useQuery({
    queryKey: [`UserSettings`],
    enabled: isEnabled,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        if (!authToken) return;
        const res = await fetch(`/.netlify/functions/fetch-settings`, {
          method: "POST",
          headers: {
            "x-auth-token": authToken,
          },
        });

        return (await res.json())?.data as IUserSettings;
      } catch {
        return {} as IUserSettings;
      }
    },
  });
};

export interface IUserSettings {
  address: `0x${string}`;
  email: string;
  telegram: string;
}
