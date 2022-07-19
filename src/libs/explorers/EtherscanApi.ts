import BlockExplorerApi, { IBlockExplorerApiClient } from './BlockExplorerApi'

export default function EtherscanApi(apiKey: string): IBlockExplorerApiClient {
  return BlockExplorerApi(`https://api.etherscan.io`, apiKey)
}
