import React from "react";
import * as Sentry from "@sentry/react";
import { Routes, createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";
import { GIT_DIRTY, GIT_HASH, RELEASE_VERSION } from "../consts";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_ENDPOINT,
  environment: process.env.REACT_APP_CONTEXT,
  release: `court-v2@${RELEASE_VERSION}-${GIT_HASH}${GIT_DIRTY}`,
  integrations: [
    new Sentry.BrowserProfilingIntegration(),
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
  ],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,

  // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ["localhost", /^https:\/\/.*--kleros-v2\.netlify\.app/],

  // Set profilesSampleRate to 1.0 to profile every transaction.
  // Since profilesSampleRate is relative to tracesSampleRate,
  // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
  // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
  // results in 25% of transactions being profiled (0.5*0.5=0.25)
  profilesSampleRate: 1.0,
});

export const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);
