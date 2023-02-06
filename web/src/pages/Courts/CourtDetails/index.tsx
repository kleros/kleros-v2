import React from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";

import { Card, Breadcrumb } from "@kleros/ui-components-library";
import { useCourtPolicy } from "queries/useCourtPolicy";
import { useCourtTree, CourtTreeQuery } from "queries/useCourtTree";

import Stats from "./Stats";
import Description from "./Description";
import StakePanel from "./StakePanel";

const CourtDetails: React.FC = () => {
  const { id } = useParams();
  const { data: policy } = useCourtPolicy(id);
  const { data } = useCourtTree();

  const courtPath = getCourtsPath(data?.court, id);

  const items = courtPath?.map((node) => ({
    text: node.name,
    value: node.id,
  }));

  return (
    <Container>
      <StyledCard>
        <h1>{policy ? policy.name : "Loading..."}</h1>
        {items && <StyledBreadcrumb items={items} />}
        <hr />
        <Stats />
        <hr />
        <StakePanel courtName={policy?.name} />
      </StyledCard>
      <StyledCard>
        <Description />
      </StyledCard>
    </Container>
  );
};

const Container = styled.div``;

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

const getCourtsPath = (
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
