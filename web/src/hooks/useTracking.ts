// useTracking.ts
import { useEffect } from "react";
import mixpanel from "../utils/mixpanel";
import crypto from "crypto";

const useTracking = (eventName: string, props?: object) => {
  useEffect(() => {
    mixpanel.track(eventName, {
      pathname: window.location.pathname,
      ...(props ?? {}),
    });
  }, [eventName, props]);
};

export const useIdentify = (userId: string | undefined, props?: object) => {
  useEffect(() => {
    if (userId) {
      mixpanel.identify(crypto.createHash("sha256").update(userId).digest("hex"));
    }
  }, [userId, props]);
};

export default useTracking;
