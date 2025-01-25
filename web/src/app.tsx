import React, { lazy, Suspense } from "react";

import { ErrorBoundary } from "react-error-boundary";
import { Route } from "react-router-dom";

import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";

import AtlasProvider from "context/AtlasProvider";
import GraphqlBatcherProvider from "context/GraphqlBatcher";
import IsListProvider from "context/IsListProvider";
import { NewDisputeProvider } from "context/NewDisputeContext";
import QueryClientProvider from "context/QueryClientProvider";
import StyledComponentsProvider from "context/StyledComponentsProvider";
const Home = lazy(() => import("./pages/Home"));
const Cases = lazy(() => import("./pages/Cases"));
const Profile = lazy(() => import("./pages/Profile"));
const Courts = lazy(() => import("./pages/Courts"));
const Jurors = lazy(() => import("./pages/Jurors"));
const DisputeResolver = lazy(() => import("./pages/Resolver"));
const GetPnk = lazy(() => import("./pages/GetPnk"));
const Settings = lazy(() => import("./pages/Settings"));
import Web3Provider from "context/Web3Provider";

import Loader from "components/Loader";
import Layout from "layout/index";

import ErrorFallback from "./components/ErrorFallback";
import { SentryRoutes } from "./utils/sentry";

const App: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Web3Provider>
          <QueryClientProvider>
            <GraphqlBatcherProvider>
              <AtlasProvider>
                <IsListProvider>
                  <NewDisputeProvider>
                    <SentryRoutes>
                      <Route path="/" element={<Layout />}>
                        <Route
                          index
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <Home />
                            </Suspense>
                          }
                        />
                        <Route
                          path="cases/*"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <Cases />
                            </Suspense>
                          }
                        />
                        <Route
                          path="courts/*"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <Courts />
                            </Suspense>
                          }
                        />
                        <Route
                          path="jurors/:page/:order/:filter"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <Jurors />
                            </Suspense>
                          }
                        />
                        <Route
                          path="profile/:page/:order/:filter"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <Profile />
                            </Suspense>
                          }
                        />
                        <Route
                          path="resolver/*"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <DisputeResolver />
                            </Suspense>
                          }
                        />
                        <Route
                          path="get-pnk/*"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <GetPnk />
                            </Suspense>
                          }
                        />
                        <Route
                          path="settings/*"
                          element={
                            <Suspense fallback={<Loader width={"48px"} height={"48px"} />}>
                              <Settings />
                            </Suspense>
                          }
                        />
                        <Route path="*" element={<h1>Page not found</h1>} />
                      </Route>
                    </SentryRoutes>
                  </NewDisputeProvider>
                </IsListProvider>
              </AtlasProvider>
            </GraphqlBatcherProvider>
          </QueryClientProvider>
        </Web3Provider>
      </ErrorBoundary>
    </StyledComponentsProvider>
  );
};

export default App;
