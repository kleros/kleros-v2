import styled from "styled-components";

export const ErrorButtonMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
  margin: 12px;
  color: ${({ theme }) => theme.error};
  font-size: 14px;
`;
