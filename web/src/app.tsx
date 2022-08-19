import React from "react";
import StyledComponentsProvider from "context/StyledComponentsProvider";
import { SWRConfig } from "swr";
import { request } from "graphql-request";
import { Routes, Route } from "react-router-dom";
import Layout from "layout/index";
import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Dashboard from "./pages/Dashboard";

const fetcherBuilder =
  (url: string) =>
  ({ query, variables }: { query: string; variables?: any }) => {
    console.log("fetch");
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
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="cases" element={<Cases />} />
            <Route path="courts" element={<h1>Courts</h1>} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route
              path="*"
              element={<h1>Justice not found here ¯\_( ͡° ͜ʖ ͡°)_/¯</h1>}
            />
          </Route>
        </Routes>
      </SWRConfig>
    </StyledComponentsProvider>
  );
};

export default App;
