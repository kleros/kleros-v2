import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    --toastify-color-info: ${({ theme }) => theme.primaryBlue};
    --toastify-color-success: ${({ theme }) => theme.success};
    --toastify-color-warning: ${({ theme }) => theme.warning};
    --toastify-color-error: ${({ theme }) => theme.error};
  }

  .react-loading-skeleton {
    z-index: 0;
    --base-color: ${({ theme }) => theme.skeletonBackground};
    --highlight-color: ${({ theme }) => theme.skeletonHighlight};
  }

  body {
    font-family: "Open Sans", sans-serif;
    margin: 0px;
    background-color: ${({ theme }) => theme.lightBlue};
  }

  html {
    box-sizing: border-box;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  *:focus {
    outline: none;
  }

  .ReactModal__Overlay {
    background-color: #1b003fcc !important;
  }

  /* Base element typography lives in styles/base-elements.css (see there). */

  textarea {
    font-family: "Open Sans";
    font-size: 14px;
  }

  input {
    font-size: 14px;
  }

  hr {
    opacity: 1;
    border: 1px solid ${({ theme }) => theme.stroke};
  }

  svg, img {
    display: inline-block;
    vertical-align: middle;
    visibility: visible;
  }

  .os-theme-dark {
    --os-handle-bg: ${({ theme }) => theme.violetPurple};
    --os-handle-bg-hover: ${({ theme }) => theme.secondaryPurple};
    --os-handle-bg-active: ${({ theme }) => theme.lavenderPurple};
  }

  /* @cyntler/react-doc-viewer injects a canvas to load pdf, this alters the height of body tag, so set to hidden */
  .hiddenCanvasElement{
    display: none;
  }

  [class*="Toastify__toast-container"] {
    top: unset;
    padding-top: 20px !important;
  }
  
  /* ── ethereum-identity-kit ── */
  /* Remap the library's CSS variables to Kleros theme colors.
   * Both base and -dark variants are set to the current theme since
   * createGlobalStyle re-renders on theme change. */
  :root {
    --ethereum-identity-kit-primary: ${({ theme }) => theme.primaryBlue};
    --ethereum-identity-kit-primary-hover: ${({ theme }) => theme.secondaryBlue};
    --ethereum-identity-kit-text-primary: ${({ theme }) => theme.primaryText};
    --ethereum-identity-kit-text-primary-dark: ${({ theme }) => theme.primaryText};
    --ethereum-identity-kit-text-neutral: ${({ theme }) => theme.secondaryText};
    --ethereum-identity-kit-text-neutral-dark: ${({ theme }) => theme.secondaryText};
    --ethereum-identity-kit-background: ${({ theme }) => theme.whiteBackground};
    --ethereum-identity-kit-background-dark: ${({ theme }) => theme.whiteBackground};
    --ethereum-identity-kit-background-overlay: ${({ theme }) => theme.blackLowOpacity};
    --ethereum-identity-kit-background-overlay-dark: ${({ theme }) => theme.blackLowOpacity};
    --ethereum-identity-kit-neutral: ${({ theme }) => theme.whiteBackground};
    --ethereum-identity-kit-neutral-dark: ${({ theme }) => theme.lightGrey};
    --ethereum-identity-kit-neutral-light: ${({ theme }) => theme.lightBackground};
    --ethereum-identity-kit-neutral-light-dark: ${({ theme }) => theme.lightGrey};
    --ethereum-identity-kit-neutral-hover: ${({ theme }) => theme.mediumBlue};
    --ethereum-identity-kit-neutral-hover-dark: ${({ theme }) => theme.mediumBlue};
    --ethereum-identity-kit-neutral-light-hover: ${({ theme }) => theme.mediumBlue};
    --ethereum-identity-kit-success: ${({ theme }) => theme.success};
    --ethereum-identity-kit-deletion: ${({ theme }) => theme.error};
    --ethereum-identity-kit-restriction: ${({ theme }) => theme.error};
    --ethereum-identity-kit-shadow-small: 0 2px 4px rgba(0,0,0,.1);
    --ethereum-identity-kit-shadow-small-dark: 0 2px 4px rgba(0,0,0,.2);
    --ethereum-identity-kit-shadow-medium: 0 2px 6px rgba(0,0,0,.1);
    --ethereum-identity-kit-shadow-medium-dark: 0 2px 6px rgba(0,0,0,.2);
  }

  /* Reset global element-level text colors inside EthID components */
  .follow-button,
  .tooltip-card,
  .profile-card,
  .profile-socials,
  .follower-tag,
  .profile-tooltip-content,
  .transaction-modal-container,
  .common-followers-container,
  .notifications-container {
    p, label, small, a, h1, h2, h3 {
      color: unset;
    }
  }

  /* EthID layout overrides */
  .tooltip-wrapper { width: fit-content; }
  .profile-tooltip-content { z-index: 9998 !important; }
  .avatar-container { font-size: 0; line-height: 0; overflow: hidden; }

  /* Scale down EthID buttons to match the rest of the UI */
  .follow-button {
    transform: scale(0.85) !important;
    transform-origin: left center;
    border-width: 1px !important;
    border-color: ${({ theme }) => theme.stroke} !important;
  }
  /* Match skeleton placeholder size to the scaled follow button */
  div[style*="39px"][style*="110px"]:has(> .loading-cell) {
    transform: scale(0.85);
    transform-origin: left center;
  }
  .follow-button:hover {
    transform: scale(0.9) !important;
    transform-origin: left center;
  }
  .follower-tag {
    transform: scale(0.85);
    transform-origin: left center;
  }

  /* The library reuses --neutral-light as a text color for dark-mode
   * stat labels, so the variable override alone is insufficient. */
  .dark .profile-stats-item-label {
    color: ${({ theme }) => theme.secondaryText} !important;
  }

  /* The action icon background is set via inline style in JS,
   * so it can't be overridden through CSS variables. */
  .transaction-modal-actions-item-header div {
    background-color: ${({ theme }) => theme.primaryBlue} !important;
  }

  /* Text/icon contrast on blue-background elements (buttons, progress, steps).
   * Dark mode: dark text on light blue. Light mode: white text on dark blue. */
  .dark .follow-button-follow,
  .dark .transaction-modal-initiate-button,
  .dark .transaction-modal-confirm-button,
  .dark .transaction-progress-bar,
  .dark .transaction-step-current,
  .dark .transaction-step-pending {
    color: ${({ theme }) => theme.black} !important;
  }
  .dark .transaction-modal-actions-item-header div svg path {
    fill: ${({ theme }) => theme.black} !important;
  }
  html:not(.dark) .follow-button-follow,
  html:not(.dark) .transaction-modal-initiate-button,
  html:not(.dark) .transaction-modal-confirm-button,
  html:not(.dark) .transaction-progress-bar,
  html:not(.dark) .transaction-step-current,
  html:not(.dark) .transaction-step-pending {
    color: ${({ theme }) => theme.white} !important;
  }
  html:not(.dark) .transaction-modal-actions-item-header div svg path {
    fill: ${({ theme }) => theme.white} !important;
  }
  .follow-button-following,
  .follow-button-pending {
    color: ${({ theme }) => theme.primaryText} !important;
  }

  /* White text/icons on the red unfollow hover state in light mode */
  html:not(.dark) .follow-button-following:hover,
  html:not(.dark) .follow-button-unfollow {
    color: white !important;
  }
  html:not(.dark) .follow-button-following:hover svg path,
  html:not(.dark) .follow-button-unfollow svg path {
    fill: white !important;
  }

  /* Tooltip/card borders and arrow */
  .tooltip-card {
    width: 360px !important;
    border-color: ${({ theme }) => theme.stroke} !important;
  }
  .profile-tooltip-arrow {
    background: ${({ theme }) => theme.whiteBackground} !important;
    border-color: ${({ theme }) => theme.stroke} !important;
  }

  /* Tooltip/card header: use a themed background and hide the default
   * EFP header image. Keep loading states visually consistent. */
  .tooltip-card > div:first-child,
  .profile-card > div:first-child {
    background-color: ${({ theme }) => theme.lightBlue};
  }
  .tooltip-card .image-with-fallback[src*="default-header"],
  .profile-card .image-with-fallback[src*="default-header"] {
    opacity: 0;
  }
  .tooltip-card > div:first-child .loading-cell,
  .profile-card > div:first-child .loading-cell,
  .tooltip-card > div:first-child [image-loaded="false"],
  .profile-card > div:first-child [image-loaded="false"] {
    background: ${({ theme }) => theme.lightBlue} !important;
    background-image: none !important;
    animation: none !important;
    color: transparent !important;
  }

  /* Skeleton shimmer gradients (overrides inline backgroundImage) */
  .loading-cell {
    background-image: linear-gradient(
      90deg,
      ${({ theme }) => theme.skeletonBackground} 0%,
      ${({ theme }) => theme.skeletonHighlight} 50%,
      ${({ theme }) => theme.skeletonBackground} 100%
    ) !important;
  }
  [image-loaded="false"] {
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.skeletonBackground} 0%,
      ${({ theme }) => theme.skeletonHighlight} 50%,
      ${({ theme }) => theme.skeletonBackground} 100%
    ) !important;
    color: transparent !important;
  }

  /* Replace EFP confetti particles with Kleros-blue versions and scale down */
  #efp_coolMode img {
    transform: scale(0.7);
  }
  html:not(.dark) #efp_coolMode img {
    content: url("/efp-follow.svg");
  }
  .dark #efp_coolMode img {
    content: url("/efp-follow-dark.svg");
  }
`;
