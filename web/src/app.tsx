import React from "react";

import { Route } from "react-router-dom";

import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";
import GraphqlBatcherProvider from "context/GraphqlBatcher";
import IsListProvider from "context/IsListProvider";
import { NewDisputeProvider } from "context/NewDisputeContext";
import QueryClientProvider from "context/QueryClientProvider";
import StyledComponentsProvider from "context/StyledComponentsProvider";
import Web3Provider from "context/Web3Provider";

import Layout from "layout/index";

import Cases from "./pages/Cases";
import Courts from "./pages/Courts";
import Dashboard from "./pages/Dashboard";
import DisputeTemplateView from "./pages/DisputeTemplateView";
import GetPnk from "./pages/GetPnk";
import Home from "./pages/Home";
import DisputeResolver from "./pages/Resolver";
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
                    <Route index element={<Home />} />
                    <Route path="cases/*" element={<Cases />} />
                    <Route path="courts/*" element={<Courts />} />
                    <Route path="dashboard/:page/:order/:filter" element={<Dashboard />} />
                    <Route path="dispute-template" element={<DisputeTemplateView />} />
                    <Route path="resolver/*" element={<DisputeResolver />} />
                    <Route path="get-pnk/*" element={<GetPnk />} />
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
