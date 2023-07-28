import React from "react";
import styled, { css } from "styled-components";
import CardView from "svgs/icons/card-view.svg";
import ListViewIcon from "svgs/icons/list-view.svg";

export type ViewFilterType = "card-view" | "list-view";

interface IViewFilter {
  view: ViewFilterType;
  setView: React.Dispatch<React.SetStateAction<ViewFilterType>>;
}

interface IStyledIcon {
  isActive: boolean;
}

const fillWithPrimaryBlue = css`
  fill: ${({ theme }) => theme.primaryBlue};
`;

const fillWithStroke = css`
  fill: ${({ theme }) => theme.stroke};
`;

const Container = styled.div`
  display: flex;
  justify-content: end;
  gap: 12px;
  width: fit-content;
  margin-left: auto;
`;

const StyledCardViewIcon = styled(CardView)<IStyledIcon>`
  ${(props) => (props.isActive ? fillWithPrimaryBlue : fillWithStroke)}
  cursor:pointer;
`;

const StyledListViewIcon = styled(ListViewIcon)<IStyledIcon>`
  ${(props) => (props.isActive ? fillWithPrimaryBlue : fillWithStroke)}
  display:block;
  cursor: pointer;
  @media (max-width: 768px) {
    display: none;
  }
`;

const ViewFilter: React.FC<IViewFilter> = ({ view, setView }) => {
  const handleViewChange = (view: ViewFilterType) => {
    setView(view);
  };

  return (
    <Container>
      <StyledCardViewIcon isActive={view === "card-view"} onClick={() => handleViewChange("card-view")} />
      <StyledListViewIcon isActive={view === "list-view"} onClick={() => handleViewChange("list-view")} />
    </Container>
  );
};

export default ViewFilter;
