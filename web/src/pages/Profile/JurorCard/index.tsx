import React from "react";

import { useTranslation } from "react-i18next";
import { Address } from "viem";

import { Card as _Card } from "@kleros/ui-components-library";

import { cn } from "utils/cn";
import { getUserLevelData } from "utils/userLevelCalculation";

import { useUserQuery, userFragment } from "queries/useUser";

import { useFragment as readFragment } from "src/graphql";

import { Divider } from "components/Divider";

import BottomContent from "./BottomContent";
import Header from "./Header";
import TopContent from "./TopContent";

const Card = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof _Card>) => (
  <_Card {...props} className={cn("flex flex-col justify-center gap-6 w-full h-auto p-6", className)} />
);

interface IJurorCard {
  searchParamAddress: Address;
}

const JurorCard: React.FC<IJurorCard> = ({ searchParamAddress }) => {
  const { t } = useTranslation();
  const { data } = useUserQuery(searchParamAddress);
  const userDetails = readFragment(userFragment, data?.user);
  const totalCoherentVotes = userDetails ? parseInt(userDetails.totalCoherentVotes) : 0;
  const totalResolvedVotes = userDetails ? parseInt(userDetails.totalResolvedVotes) : 0;
  const totalResolvedDisputes = userDetails ? parseInt(userDetails.totalResolvedDisputes) : 0;
  const coherenceScore = userDetails ? parseInt(userDetails.coherenceScore) : 0;
  const userLevelData = getUserLevelData(coherenceScore);

  return (
    <div>
      <Header
        levelTitle={t(userLevelData.titleKey)}
        levelNumber={userLevelData.level}
        {...{ totalCoherentVotes, totalResolvedVotes, searchParamAddress }}
      />
      <Card>
        <TopContent address={searchParamAddress} {...{ totalResolvedDisputes }} />
        <Divider />
        <BottomContent {...{ userLevelData, totalCoherentVotes, totalResolvedVotes, searchParamAddress }} />
      </Card>
    </div>
  );
};

export default JurorCard;
