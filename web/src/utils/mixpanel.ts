import mixpanel from "mixpanel-browser";

mixpanel.init(process.env.REACT_APP_MIXPANEL_TOKEN!, {
  debug: true,
  track_pageview: true,
  persistence: "localStorage",
});

export default mixpanel;
