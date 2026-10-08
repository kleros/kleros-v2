import React from "react";

import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useToggle } from "react-use";

import { Card, Breadcrumb } from "@kleros/ui-components-library";

import { isProductionDeployment } from "consts/index";
import { getDescriptiveCourtName } from "utils/getDescriptiveCourtName";

import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";

import ClaimPnkButton from "components/ClaimPnkButton";
import { Divider } from "components/Divider";
import HowItWorks from "components/HowItWorks";
import LatestCases from "components/LatestCases";
import Staking from "components/Popup/MiniGuides/Staking";
import ScrollTop from "components/ScrollTop";
import { StyledSkeleton } from "components/StyledSkeleton";

import Description from "./Description";
import JurorsStakedByCourt from "./JurorsStakedByCourt";
import StakePanel from "./StakePanel";
import StakingHistoryByCourt from "./StakingHistoryByCourt";
import Stats from "./Stats";
import TopSearch from "./TopSearch";

const CourtDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { data } = useCourtTree();
  const [isStakingMiniGuideOpen, toggleStakingMiniGuide] = useToggle(false);
  const navigate = useNavigate();

  const courtPath = getCourtsPath(data?.court, id);

  const breadcrumbItems =
    courtPath?.map((node) => ({
      text: node.name,
      value: node.id,
    })) ?? [];

  const currentCourt = courtPath?.[courtPath.length - 1];
  const courtName = currentCourt?.name;

  return (
    <div>
      <TopSearch />
      <Card className="p-4 mt-3 w-full h-auto min-h-[100px] lg:p-8">
        <h1 className="flex flex-row text-[calc(20px_+_(24_-_20)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] justify-between gap-2 flex-wrap mb-4">
          <div className="flex flex-col gap-2">
            {data ? courtName : <StyledSkeleton width={200} />}
            {breadcrumbItems.length > 1 ? (
              <Breadcrumb
                items={breadcrumbItems}
                clickable
                callback={(courtId: string) => navigate(`/courts/${courtId}`)}
                className="items-center [&_button]:text-[16px]"
              />
            ) : null}
          </div>
          <div className="flex flex-wrap flex-row justify-center gap-5 lg:items-end">
            {!isProductionDeployment() && <ClaimPnkButton />}
            <HowItWorks
              isMiniGuideOpen={isStakingMiniGuideOpen}
              toggleMiniGuide={toggleStakingMiniGuide}
              MiniGuideComponent={Staking}
            />
          </div>
        </h1>
        <Divider />
        <div className="flex flex-row justify-between mt-6 gap-4 flex-wrap lg:[&_>_*]:[flex:1_1_calc(50%_-_8px)]">
          <StakePanel {...{ courtName }} />
          <Stats />
        </div>
      </Card>
      <Card className="p-4 mt-3 w-full h-auto min-h-[100px] lg:p-8">
        <Description />
      </Card>
      <LatestCases
        title={t("misc.latest_cases_in_court", { court: getDescriptiveCourtName(courtName) })}
        filters={{ court: id }}
      />
      <div className="flex flex-col gap-8 mt-[calc(28px_+_(48_-_28)_*_(min(max(100vw,_375px),_1250px)_-_375px)_/_(875))] lg:flex-row lg:gap-12 lg:[&_>_*]:[flex:1_1_calc(50%_-_24px)]">
        <JurorsStakedByCourt {...{ courtName }} />
        <StakingHistoryByCourt {...{ courtName }} />
      </div>
      <ScrollTop />
    </div>
  );
};

export default CourtDetails;

interface IItem {
  name: string;
  id: string;
}

export const getCourtsPath = (
  node: CourtTreeQuery["court"],
  id: string | undefined,
  path: IItem[] = []
): IItem[] | null => {
  if (!node || !id) return null;

  if (node.id === id) {
    path.unshift({
      name: node.name || "",
      id: node.id,
    });
    return path;
  }

  if (node.children) {
    for (const child of node.children) {
      const pathFromChild = getCourtsPath(child as CourtTreeQuery["court"], id, path.slice());
      if (pathFromChild) {
        pathFromChild.unshift({
          name: node.name || "",
          id: node.id,
        });
        return pathFromChild;
      }
    }
  }

  return null;
};
