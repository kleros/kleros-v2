import React from "react";
import { Route } from "react-router-dom";
import { SentryRoutes } from "./utils/sentry";
import "react-loading-skeleton/dist/skeleton.css";
import "react-toastify/dist/ReactToastify.css";
import Web3Provider from "context/Web3Provider";
import IsListProvider from "context/IsListProvider";
import QueryClientProvider from "context/QueryClientProvider";
import StyledComponentsProvider from "context/StyledComponentsProvider";
import RefetchOnBlock from "context/RefetchOnBlock";
import Layout from "layout/index";
import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Dashboard from "./pages/Dashboard";
import Courts from "./pages/Courts";
import DisputeTemplateView from "./pages/DisputeTemplateView";
import DisputeResolver from "./pages/Resolver";
import { NewDisputeProvider } from "./context/NewDisputeContext";

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
                  <Route index element={<Home />} />
                  <Route path="cases/*" element={<Cases />} />
                  <Route path="courts/*" element={<Courts />} />
                  <Route path="dashboard/:page/:order/:filter" element={<Dashboard />} />
                  <Route path="disputeTemplate" element={<DisputeTemplateView />} />
                  <Route path="resolver/*" element={<DisputeResolver />} />
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
