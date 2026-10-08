import React from "react";

import Reactmkdwn from "react-markdown";

const ReactMarkdown: React.FC<{ children: string }> = ({ children }) => {
  if (!children) {
    return <div>No content available</div>;
  }
  try {
    return <Reactmkdwn className="text-base">{children}</Reactmkdwn>;
  } catch {
    return <div>Error rendering content</div>;
  }
};

export default ReactMarkdown;
