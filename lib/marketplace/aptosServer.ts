import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MODULE_ADDRESS } from "@/lib/constants";

const DEFAULT_NODE = "https://api.testnet.aptoslabs.com/v1";

let _aptos: Aptos | null = null;

export function getAptosServerClient(): Aptos {
  if (!_aptos) {
    const nodeUrl = process.env.NEXT_PUBLIC_APTOS_NODE_URL ?? DEFAULT_NODE;
    _aptos = new Aptos(
      new AptosConfig({
        network: Network.TESTNET,
        fullnode: nodeUrl,
        ...(process.env.NEXT_PUBLIC_APTOS_API_KEY
          ? { clientConfig: { API_KEY: process.env.NEXT_PUBLIC_APTOS_API_KEY } }
          : {}),
      })
    );
  }
  return _aptos;
}

export async function checkOnChainAccess(
  buyerAddress: string,
  datasetAddr: string
): Promise<boolean> {
  const aptos = getAptosServerClient();
  try {
    const [result] = await aptos.view({
      payload: {
        function: `${MODULE_ADDRESS}::marketplace::has_access`,
        typeArguments: [],
        functionArguments: [buyerAddress, datasetAddr],
      },
    });
    return result as boolean;
  } catch {
    return false;
  }
}

export async function getOnChainBlobName(datasetAddr: string): Promise<string> {
  const aptos = getAptosServerClient();
  const [result] = await aptos.view({
    payload: {
      function: `${MODULE_ADDRESS}::dataset_registry::get_blob_name`,
      typeArguments: [],
      functionArguments: [datasetAddr],
    },
  });
  return result as string;
}
