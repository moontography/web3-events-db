import axios, { Axios } from 'axios'
import { AbiItem } from 'web3-utils'

export interface IAbi {
  json: string
  obj: AbiItem[]
}

export interface IBlockExplorerApiClient {
  client: Axios
  getAbi(contract: string): Promise<IAbi>
  isContractVerified(contract: string): Promise<boolean>
}

export default function BlockExplorerApi(
  baseURL: string,
  apiKey: string
): IBlockExplorerApiClient {
  return {
    client: axios.create({
      baseURL,
      params: {
        apikey: apiKey,
      },
    }),

    async getAbi(contract: string): Promise<IAbi> {
      const {
        data: { result },
      } = await this.client.get('/api', {
        params: {
          module: 'contract',
          action: 'getabi',
          address: contract,
        },
      })
      const abi = JSON.parse(result)
      return { json: result, obj: abi }
    },

    async isContractVerified(contract: string): Promise<boolean> {
      const { obj } = await this.getAbi(contract)
      return !!obj
    },
  }
}
