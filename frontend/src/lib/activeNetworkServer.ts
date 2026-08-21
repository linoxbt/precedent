import { cookies } from "next/headers";
import { DEFAULT_GENLAYER_NETWORK, NETWORK_COOKIE_NAME, isValidNetworkKey, type GenLayerNetworkKey } from "./genlayerConfig";

/** Server-component-only: reads the network the user last picked via NetworkSwitcher. */
export async function getActiveNetworkServer(): Promise<GenLayerNetworkKey> {
  const store = await cookies();
  const value = store.get(NETWORK_COOKIE_NAME)?.value;
  return isValidNetworkKey(value) ? value : DEFAULT_GENLAYER_NETWORK;
}
