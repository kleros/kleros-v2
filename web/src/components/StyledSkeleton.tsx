import React from "react";

import Skeleton from "react-loading-skeleton";

import { cn } from "utils/cn";

export const StyledSkeleton = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof Skeleton>) => (
  <Skeleton {...props} className={cn("z-0", className)} />
);

export const SkeletonDisputeCard = () => (
  <div className="w-full">
    <Skeleton className="h-[calc(270px_+_(296_-_270)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))]" />
  </div>
);

export const SkeletonDisputeListItem = () => <Skeleton className="h-[62px]" />;

export const SkeletonDisputeListRow = () => <Skeleton className="h-[86px]" />;

export const SkeletonVoteCard = () => <Skeleton className="h-[64px]" />;

export const SkeletonEvidenceCard = () => (
  <div className="w-full [&_span]:w-full [&_span]:h-[146px] [&_span]:flex">
    <Skeleton />
  </div>
);
