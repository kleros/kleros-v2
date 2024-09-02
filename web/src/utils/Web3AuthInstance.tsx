// Web3Auth Libraries
import { CHAIN_NAMESPACES, WALLET_ADAPTERS, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { Web3Auth } from "@web3auth/modal";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Chain } from "wagmi/chains";

// Create Web3AuthConnector Instance
export function Web3AuthConnectorInstance(web3AuthInstance: Web3Auth) {
  const modalConfig = {
    [WALLET_ADAPTERS.OPENLOGIN]: {
      label: "openlogin",
      loginMethods: {
        facebook: {
          // it will hide the facebook option from the Web3Auth modal.
          name: "facebook login",
          showOnModal: false,
        },
      },
      // setting it to false will hide all social login methods from modal.
      showOnModal: true,
    },
  };

  return Web3AuthConnector({
    web3AuthInstance,
    modalConfig,
  });
}

export function Web3AuthInstance(chains: Chain[], appName: string) {
  // Create Web3Auth Instance
  const name = appName;
  console.log(chains[0].id);
  const chainConfig = {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x" + chains[0].id.toString(16),
    rpcTarget: chains[0].rpcUrls.default.http[0], // This is the public RPC we have added, please pass on your own endpoint while creating an app
    displayName: chains[0].name,
    tickerName: chains[0].nativeCurrency?.name,
    ticker: chains[0].nativeCurrency?.symbol,
    blockExplorerUrl: chains[0].blockExplorers?.default.url[0] as string,
  };

  const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig } });

  const web3AuthInstance = new Web3Auth({
    clientId: "BL8AeNAyRT1eZuwyXy3DimD4Ez4Bedcx2f7BxgQQdMVRE5fnlqtQp__XK-rGec1C5vbdQCTIxvtb7nPtgrpmjHQ",
    chainConfig,
    privateKeyProvider,
    uiConfig: {
      appName: name,
      loginMethodsOrder: ["github", "google"],
      defaultLanguage: "en",
      modalZIndex: "2147483647",
      logoLight: "https://web3auth.io/images/web3authlog.png",
      logoDark: "https://web3auth.io/images/web3authlogodark.png",
      uxMode: "popup",
      mode: "light",
    },
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    enableLogging: true,
  });

  /*   const walletServicesPlugin = new WalletServicesPlugin({
    walletInitOptions: {
      whiteLabel: {
        showWidgetButton: true,
      }
    }
  });
  web3AuthInstance.addPlugin(walletServicesPlugin); */

  return web3AuthInstance;
}
