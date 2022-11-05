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

const fetcherBuilder =
  (url: string) =>
  ({ query, variables }: { query: string; variables?: any }) => {
    console.log("fetching subgraph");
    return request(url, query, variables);
  };

const App: React.FC = () => {
  return (
    <StyledComponentsProvider>
      <SWRConfig
        value={{
          fetcher: fetcherBuilder(
            "https://api.thegraph.com/subgraphs/name/alcercu/kleros-core"
          ),
        }}
      >
        <Web3Provider>
          <WrongChainBoundary>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="cases/*" element={<Cases />} />
                <Route path="courts" element={<h1>Courts</h1>} />
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
