import React, { useState } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import { useAccount, useNetwork, useWalletClient, usePublicClient } from "wagmi";
import { Card, Breadcrumb, Button } from "@kleros/ui-components-library";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";
import { DEFAULT_CHAIN } from "consts/chains";
import { wrapWithToast } from "utils/wrapWithToast";
import { isUndefined } from "utils/index";
import Stats from "./Stats";
import Description from "./Description";
import StakePanel from "./StakePanel";
import { usePnkFaucetWithdrewAlready, prepareWritePnkFaucet } from "hooks/contracts/generated";

const CourtDetails: React.FC = () => {
  const { id } = useParams();
  const [isSending, setIsSending] = useState(false);
  const { data: policy } = useCourtPolicy(id);
  const { data } = useCourtTree();
  const { chain } = useNetwork();
  const { address } = useAccount();
  const { data: claimed } = usePnkFaucetWithdrewAlready({
    enabled: !isUndefined(address),
    args: [address],
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

  const courtPath = getCourtsPath(data?.court, id);

  const items = courtPath?.map((node) => ({
    text: node.name,
    value: node.id,
  }));

  return (
    <Container>
      <StyledCard>
        <h1>{policy ? policy.name : "Loading..."}</h1>
        <ButtonContainer>
          {items && <StyledBreadcrumb items={items} />}
          {chain?.id === DEFAULT_CHAIN && !claimed && (
            <Button
              variant="primary"
              text={!claimed ? "Claim PNK" : "Already claimed"}
              onClick={handleRequest}
              isLoading={isSending}
              disabled={isSending || claimed}
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

const Container = styled.div``;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;

const StyledCard = styled(Card)`
  margin-top: 16px;
  width: 100%;
  height: auto;
  padding: 16px;
  min-height: 100px;
`;

const StyledBreadcrumb = styled(Breadcrumb)`
  margin: 16px 0 12px 0;
`;

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
