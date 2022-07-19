import BlockExplorerApi, { IBlockExplorerApiClient } from './BlockExplorerApi'

export default function BscscanApi(apiKey: string): IBlockExplorerApiClient {
  return BlockExplorerApi(`https://api.bscscan.com`, apiKey)
}
