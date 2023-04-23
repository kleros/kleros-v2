import React from "react";
import { SWRConfig } from "swr";
import { request } from "graphql-request";
import { Routes, Route } from "react-router-dom";
import "react-loading-skeleton/dist/skeleton.css";
import Web3Provider from "context/Web3Provider";
import StyledComponentsProvider from "context/StyledComponentsProvider";
import WrongChainBoundary from "components/WrongChainBoundary";
import Layout from "layout/index";
import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Dashboard from "./pages/Dashboard";
import Courts from "./pages/Courts";

import "react-toastify/dist/ReactToastify.css";

const fetcherBuilder =
  (url: string) =>
  ({ query, variables }: { query: string; variables?: any }) => {
    console.log("fetching subgraph", query, variables);
    return request(url, query, variables);
  };

const App: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <SWRConfig
        value={{
          fetcher: fetcherBuilder(
            process.env.REACT_APP_SUBGRAPH_ENDPOINT ??
              "https://api.thegraph.com/subgraphs/name/alcercu/kleroscoretest"
          ),
        }}
      >
        <Web3Provider>
          <WrongChainBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="cases/*" element={<Cases />} />
                <Route path="courts/*" element={<Courts />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route
                  path="*"
                  element={<h1>Justice not found here ¯\_( ͡° ͜ʖ ͡°)_/¯</h1>}
                />
              </Route>
            </Routes>
          </WrongChainBoundary>
        </Web3Provider>
      </SWRConfig>
    </StyledComponentsProvider>
  );
};

export default App;
