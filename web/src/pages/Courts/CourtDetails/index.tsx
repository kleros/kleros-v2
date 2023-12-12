import React, { useState } from "react";
import styled, { css } from "styled-components";
import { landscapeStyle } from "styles/landscapeStyle";
import { useToggle } from "react-use";
import { useParams } from "react-router-dom";
import { useAccount, useNetwork, useWalletClient, usePublicClient } from "wagmi";
import { Card, Breadcrumb, Button } from "@kleros/ui-components-library";
import { formatEther } from "viem";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";
import { DEFAULT_CHAIN } from "consts/chains";
import { usePNKFaucetAddress } from "hooks/useContractAddress";
import { wrapWithToast } from "utils/wrapWithToast";
import { isUndefined } from "utils/index";
import { StyledSkeleton } from "components/StyledSkeleton";
import LatestCases from "components/LatestCases";
import Stats from "./Stats";
import Description from "./Description";
import StakePanel from "./StakePanel";
import HowItWorks from "components/HowItWorks";
import Staking from "components/Popup/MiniGuides/Staking";
import { usePnkFaucetWithdrewAlready, prepareWritePnkFaucet, usePnkBalanceOf } from "hooks/contracts/generated";
import { responsiveSize } from "styles/responsiveSize";

const Container = styled.div``;

const CourtHeader = styled.h1`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
`;

const CourtInfo = styled.div`
  display: flex:
  flex-direction: column;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      gap: 32px;
    `
  )};
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;

  ${landscapeStyle(
    () => css`
      align-items: flex-end;
      gap: 32px;
    `
  )};
`;

const StyledCard = styled(Card)`
  padding: ${responsiveSize(16, 32)};
  margin-top: ${responsiveSize(16, 24)};
  width: 100%;
  height: auto;
  min-height: 100px;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  display: flex;
  margin-top: 12px;
  align-items: center;
`;

const StyledBreadcrumbSkeleton = styled.div`
  margin-top: 12px;
`;

const CourtDetails: React.FC = () => {
  const { id } = useParams();
  const [isSending, setIsSending] = useState(false);
  const { data: policy } = useCourtPolicy(id);
  const { data } = useCourtTree();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: claimed } = usePnkFaucetWithdrewAlready({
    enabled: !isUndefined(address),
    args: [address ?? "0x00"],
    watch: true,
  });
  const [isStakingMiniGuideOpen, toggleStakingMiniGuide] = useToggle(false);

  const faucetAddress = usePNKFaucetAddress();
  const { data: balance } = usePnkBalanceOf({
    args: [faucetAddress],
    watch: true,
  });
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const handleRequest = async () => {
    setIsSending(true);
    const { request } = await prepareWritePnkFaucet({
      functionName: "request",
    });
    if (walletClient) {
      wrapWithToast(async () => await walletClient.writeContract(request), publicClient).finally(() => {
        setIsSending(false);
      });
    }
  };
  const faucetCheck = !isUndefined(balance) && parseInt(formatEther(balance)) > 200;
  const courtPath = getCourtsPath(data?.court, id);

  const items = [{ text: "🏛️", value: "0" }];
  items.push(
    ...(courtPath?.map((node) => ({
      text: node.name,
      value: node.id,
    })) ?? [])
  );

  return (
    <Container>
      <StyledCard>
        <CourtHeader>
          <CourtInfo>
            {policy ? policy.name : <StyledSkeleton width={200} />}
            {items.length > 1 ? (
              <StyledBreadcrumb items={items} />
            ) : (
              <StyledBreadcrumbSkeleton>
                <StyledSkeleton width={100} />
              </StyledBreadcrumbSkeleton>
            )}
          </CourtInfo>
          <ButtonContainer>
            <HowItWorks
              isMiniGuideOpen={isStakingMiniGuideOpen}
              toggleMiniGuide={toggleStakingMiniGuide}
              MiniGuideComponent={Staking}
            />
            {chain?.id === DEFAULT_CHAIN && !claimed && (
              <Button
                variant="primary"
                text={faucetCheck ? "Claim PNK" : "Empty Faucet"}
                onClick={handleRequest}
                isLoading={isSending}
                disabled={isSending || claimed || !faucetCheck}
              />
            )}
          </ButtonContainer>
        </CourtHeader>
        <hr />
        <Stats />
        <hr />
        <StakePanel id={!isUndefined(id) ? id : ""} courtName={policy?.name} />
      </StyledCard>
      <StyledCard>
        <Description />
      </StyledCard>
      <LatestCases filters={{ court: id }} />
    </Container>
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
      const pathFromChild = getCourtsPath(child, id, path.slice());
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
