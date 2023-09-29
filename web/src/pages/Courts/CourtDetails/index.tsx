import React, { useState } from "react";
import styled from "styled-components";
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
import Stats from "./Stats";
import Description from "./Description";
import StakePanel from "./StakePanel";
import { usePnkFaucetWithdrewAlready, prepareWritePnkFaucet, usePnkBalanceOf } from "hooks/contracts/generated";

const Container = styled.div``;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const StyledCard = styled(Card)`
  margin-top: calc(16px + (24 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  width: 100%;
  height: auto;
  padding: calc(16px + (32 - 16) * (min(max(100vw, 375px), 1250px) - 375px) / 875);
  min-height: 100px;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
`;

const StyledBreadcrumbSkeleton = styled.div`
  margin-bottom: 12px;
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
        <h1>{policy ? policy.name : <StyledSkeleton width={200} />}</h1>
        <ButtonContainer>
          {items.length > 1 ? (
            <StyledBreadcrumb items={items} />
          ) : (
            <StyledBreadcrumbSkeleton>
              <StyledSkeleton width={100} />
            </StyledBreadcrumbSkeleton>
          )}
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
        <hr />
        <Stats />
        <hr />
        <StakePanel id={!isUndefined(id) ? id : ""} courtName={policy?.name} />
      </StyledCard>
      <StyledCard>
        <Description />
      </StyledCard>
    </Container>
  );
};

export default CourtDetails;

interface IItem {
  name: string;
  id: string;
}

const getCourtsPath = (node: CourtTreeQuery["court"], id: string | undefined, path: IItem[] = []): IItem[] | null => {
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
