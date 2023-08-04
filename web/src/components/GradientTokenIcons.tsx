import React from "react";
import styled, { css } from "styled-components";

const LinearGradientPath = styled.path<{ gradient: string }>`
  ${({ gradient }) =>
    gradient &&
    css`
      stroke: url(#${gradient});
    `}
`;

interface IGradientTokenIcons {
  icon: string;
}

const GradientTokenIcons: React.FC<IGradientTokenIcons> = ({ icon }) => {
  return (
    <>
      {icon === "ETH" ? (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <LinearGradientPath
            gradient="eth"
            id="paint0_linear_14360_27088"
            d="M9.86602 28.0687L22.923 36.0836V47.1905L9.86602 28.0687ZM23.423 36.0836L36.4799 28.0687L23.423 47.1905V36.0836ZM23.423 16.428V0.930308L36.666 23.7911L23.423 16.428ZM36.8415 24.4607L23.423 32.703V17L36.8415 24.4607ZM22.923 0.929777V16.4279L9.67081 23.7913L22.923 0.929777ZM22.923 32.7032L9.49539 24.4607L22.923 16.9999V32.7032Z"
          />
          <defs>
            <linearGradient id="eth" x1="23.173" y1="0" x2="23.173" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6CC5FF" />
              <stop offset="1" stopColor="#B45FFF" />
            </linearGradient>
          </defs>
        </svg>
      ) : (
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <LinearGradientPath
            gradient="pnk"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M15.7151 6L35.6632 7.30096L43.9078 25.526L32.6361 42L12.2385 41.132L4 21.1862L15.7151 6ZM16.2222 7.03373L13.1105 22.2033L31.3917 13.6461L16.2222 7.03373ZM31.8965 14.3445L13.3445 23.0284L29.1334 34.8701L31.8965 14.3445ZM28.5319 35.4771L12.9497 23.7905V40.1518L28.5319 35.4771ZM12.1032 38.5872V23.2874L5.18188 21.8302L12.1032 38.5872ZM5.23158 20.9756L12.1974 22.4421L15.1303 8.14394L5.23158 20.9756ZM15.0532 40.4045L31.7195 41.1137L29.2373 36.1493L15.0532 40.4045ZM29.9956 35.773L32.4763 40.7345L41.6905 27.2676L29.9956 35.773ZM41.9695 23.295L35.3631 8.69144L32.9292 13.5593L41.9695 23.295ZM32.2205 13.0839L18.3024 7.01704L34.7186 8.08766L32.2205 13.0839ZM32.7193 14.5773L30.0082 34.7171L42.7892 25.4218L32.7193 14.5773Z"
            fill="url(#paint0_linear_14360_27090)"
          />
          <defs>
            <linearGradient id="pnk" x1="23.9539" y1="6" x2="23.9539" y2="42" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6CC5FF" />
              <stop offset="1" stopColor="#B45FFF" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </>
  );
};
export default GradientTokenIcons;
