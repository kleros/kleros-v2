/** Fake env for unit tests: modules that throw at import without these keys can load. No real keys. */
export const TEST_URLS = {
  coreSubgraph: "http://subgraph.test/core",
  drtSubgraph: "http://subgraph.test/drt",
  atlas: "http://atlas.test",
  shutterApi: "http://shutter.test",
} as const;

export const TEST_ENV = {
  REACT_APP_DEPLOYMENT: "devnet",
  WALLETCONNECT_PROJECT_ID: "test-project-id",
  ALCHEMY_API_KEY: "test-alchemy-key",
  REACT_APP_CORE_SUBGRAPH: TEST_URLS.coreSubgraph,
  REACT_APP_DRT_ARBSEPOLIA_SUBGRAPH: TEST_URLS.drtSubgraph,
  REACT_APP_ATLAS_URI: TEST_URLS.atlas,
  REACT_APP_SHUTTER_API: TEST_URLS.shutterApi,
  REACT_APP_SPAM_EVIDENCES_IDS: "0-2,3-1",
};
