import React, { lazy, Suspense } from "react";
import { Route } from "react-router-dom";
import { SentryRoutes } from "./utils/sentry";
import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";
import Web3Provider from "context/Web3Provider";
import IsListProvider from "context/IsListProvider";
import QueryClientProvider from "context/QueryClientProvider";
import StyledComponentsProvider from "context/StyledComponentsProvider";
import RefetchOnBlock from "context/RefetchOnBlock";
import { NewDisputeProvider } from "./context/NewDisputeContext";
import Layout from "layout/index";
import Loading from "./Loading";

const Home = lazy(() => import("./pages/Home"));
const Cases = lazy(() => import("./pages/Cases"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Courts = lazy(() => import("./pages/Courts"));
const DisputeTemplateView = lazy(() => import("./pages/DisputeTemplateView"));
const DisputeResolver = lazy(() => import("./pages/Resolver"));

const App: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <QueryClientProvider>
        <RefetchOnBlock />
        <Web3Provider>
          <IsListProvider>
            <NewDisputeProvider>
              <SentryRoutes>
                <Route path="/" element={<Layout />}>
                  <Route
                    index
                    element={
                      <Suspense fallback={<Loading />}>
                        <Home />
                      </Suspense>
                    }
                  />
                  <Route
                    path="cases/*"
                    element={
                      <Suspense fallback={<Loading />}>
                        <Cases />
                      </Suspense>
                    }
                  />
                  <Route
                    path="courts/*"
                    element={
                      <Suspense fallback={<Loading />}>
                        <Courts />
                      </Suspense>
                    }
                  />
                  <Route
                    path="dashboard/:page/:order/:filter"
                    element={
                      <Suspense fallback={<Loading />}>
                        <Dashboard />
                      </Suspense>
                    }
                  />
                  <Route
                    path="disputeTemplate"
                    element={
                      <Suspense fallback={<Loading />}>
                        <DisputeTemplateView />
                      </Suspense>
                    }
                  />
                  <Route
                    path="resolver/*"
                    element={
                      <Suspense fallback={<Loading />}>
                        <DisputeResolver />
                      </Suspense>
                    }
                  />
                  <Route path="*" element={<h1>Justice not found here ¯\_( ͡° ͜ʖ ͡°)_/¯</h1>} />
                </Route>
              </SentryRoutes>
            </NewDisputeProvider>
          </IsListProvider>
        </Web3Provider>
      </QueryClientProvider>
    </StyledComponentsProvider>
  );
};

export default App;
