import styled from "styled-components";

export const Divider = styled.hr`
  display: flex;
  width: 100%;
  border: none;
  height: 1px;
  background-color: ${({ theme }) => theme.stroke};
  margin: 0;
`;
