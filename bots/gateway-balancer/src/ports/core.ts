import type { AppConfig } from "../config/schema";
import type { Address } from "../domain";
import type { ChainClients } from "./chain";
import type { Clock } from "./clock";
import type { TxExecutor } from "./executor";
import type { Journal } from "./journal";
import type { Logger } from "./logger";
import type { Notifier } from "./notifier";

/** What the platform lane provides to every loop. */
export interface CorePorts {
  config: AppConfig;
  logger: Logger;
  clock: Clock;
  journal: Journal;
  chains: ChainClients;
  executor: TxExecutor;
  notifier: Notifier;
  /** The balancer EOA, the same address on every chain. */
  signer: Address;
}
