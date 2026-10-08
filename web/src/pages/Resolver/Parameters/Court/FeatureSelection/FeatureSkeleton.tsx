import React from "react";

import Skeleton from "react-loading-skeleton";

const FeatureSkeleton: React.FC = () => {
  return (
    <div className="w-full flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="w-[25%] h-[22px]" /> <Skeleton className="w-[75%] h-[19px]" />
      </div>
      <Skeleton className="w-[20%] h-[19px]" />
      <Skeleton className="w-[20%] h-[19px]" />
    </div>
  );
};

export default FeatureSkeleton;
