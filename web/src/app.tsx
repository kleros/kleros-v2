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
import GraphqlBatcherProvider from "context/GraphqlBatcher";
import { NewDisputeProvider } from "context/NewDisputeContext";
import Layout from "layout/index";
import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Dashboard from "./pages/Dashboard";
import Courts from "./pages/Courts";
import DisputeTemplateView from "./pages/DisputeTemplateView";
import DisputeResolver from "./pages/Resolver";
import GetPnk from "./pages/GetPnk";
import { TokenSelectProvider } from "./pages/GetPnk/Swap/TokenSelect/TokenSelectProvider";

const App: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <QueryClientProvider>
        <RefetchOnBlock />
        <GraphqlBatcherProvider>
          <Web3Provider>
            <IsListProvider>
              <NewDisputeProvider>
                <TokenSelectProvider>
                  <SentryRoutes>
                    <Route path="/" element={<Layout />}>
                      <Route index element={<Home />} />
                      <Route path="cases/*" element={<Cases />} />
                      <Route path="courts/*" element={<Courts />} />
                      <Route path="dashboard/:page/:order/:filter" element={<Dashboard />} />
                      <Route path="disputeTemplate" element={<DisputeTemplateView />} />
                      <Route path="resolver/*" element={<DisputeResolver />} />
                      <Route path="getPnk/*" element={<GetPnk />} />
                      <Route path="*" element={<h1>Justice not found here ¯\_( ͡° ͜ʖ ͡°)_/¯</h1>} />
                    </Route>
                  </SentryRoutes>
                </TokenSelectProvider>
              </NewDisputeProvider>
            </IsListProvider>
          </Web3Provider>
        </GraphqlBatcherProvider>
      </QueryClientProvider>
    </StyledComponentsProvider>
  );
};

export default App;
