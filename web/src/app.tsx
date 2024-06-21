import React, { lazy, Suspense } from "react";

import { Route } from "react-router-dom";

import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";
import GraphqlBatcherProvider from "context/GraphqlBatcher";
import IsListProvider from "context/IsListProvider";
import { NewDisputeProvider } from "context/NewDisputeContext";
import QueryClientProvider from "context/QueryClientProvider";
import StyledComponentsProvider from "context/StyledComponentsProvider";
const Home = lazy(() => import("./pages/Home"));
const Cases = lazy(() => import("./pages/Cases"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Courts = lazy(() => import("./pages/Courts"));
const DisputeTemplateView = lazy(() => import("./pages/DisputeTemplateView"));
const DisputeResolver = lazy(() => import("./pages/Resolver"));
const GetPnk = lazy(() => import("./pages/GetPnk"));
import Web3Provider from "context/Web3Provider";

import Layout from "layout/index";

import { SentryRoutes } from "./utils/sentry";

const App: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <Web3Provider>
        <QueryClientProvider>
          <GraphqlBatcherProvider>
            <IsListProvider>
              <NewDisputeProvider>
                <SentryRoutes>
                  <Route path="/" element={<Layout />}>
                    <Route
                      index
                      element={
                        <Suspense>
                          <Home />
                        </Suspense>
                      }
                    />
                    <Route
                      path="cases/*"
                      element={
                        <Suspense>
                          <Cases />
                        </Suspense>
                      }
                    />
                    <Route
                      path="courts/*"
                      element={
                        <Suspense>
                          <Courts />
                        </Suspense>
                      }
                    />
                    <Route
                      path="dashboard/:page/:order/:filter"
                      element={
                        <Suspense>
                          <Dashboard />
                        </Suspense>
                      }
                    />
                    <Route
                      path="dispute-template"
                      element={
                        <Suspense>
                          <DisputeTemplateView />
                        </Suspense>
                      }
                    />
                    <Route
                      path="resolver/*"
                      element={
                        <Suspense>
                          <DisputeResolver />
                        </Suspense>
                      }
                    />
                    <Route
                      path="get-pnk/*"
                      element={
                        <Suspense>
                          <GetPnk />
                        </Suspense>
                      }
                    />
                    <Route path="*" element={<h1>Justice not found here ¯\_( ͡° ͜ʖ ͡°)_/¯</h1>} />
                  </Route>
                </SentryRoutes>
              </NewDisputeProvider>
            </IsListProvider>
          </GraphqlBatcherProvider>
        </QueryClientProvider>
      </Web3Provider>
    </StyledComponentsProvider>
  );
};

export default App;
