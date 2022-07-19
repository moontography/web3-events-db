require('dotenv').config()

import assert from 'assert'
import Web3 from 'web3'
import { AbiItem } from 'web3-utils'
import BscscanApi from './explorers/BscscanApi'
import EtherscanApi from './explorers/EtherscanApi'

type PromiseResolve = (resolution?: any) => void
type PromiseReject = (error: any) => void
type onConnect = (
  subId: string,
  resolve: PromiseResolve,
  reject: PromiseReject
) => void
type onData = (evt: any, resolve: PromiseResolve, reject: PromiseReject) => void
type onChanged = (
  evt: any,
  resolve: PromiseResolve,
  reject: PromiseReject
) => void
type onError = (
  error: any,
  receipt: any,
  resolve: PromiseResolve,
  reject: PromiseReject
) => void

export interface IContractEventReaderOptionsOptional {
  network?: 'eth' | 'bsc' | 'polygon' | 'avax'
  blockExplorerApiKey?: string
  wsRpc: string
  contract: string
  contractAbi?: AbiItem[]
  eventName: string
  onConnect?: onConnect
  onData?: onData
  onError?: onError
  onChanged?: onChanged
}

export type IContractEventReaderOptions =
  IContractEventReaderOptionsOptional & {
    onData: onData
  }

export default function ContractEventReader(
  opts: IContractEventReaderOptionsOptional
) {
  const NOOP: any = () => {}

  return {
    web3: new Web3(),
    abi: opts.contractAbi,

    async init(providedWeb3?: Web3) {
      if (!opts.contractAbi) {
        switch (opts.network) {
          case 'bsc':
            assert(opts.blockExplorerApiKey, 'must have block explorer API key')
            const bscscan = BscscanApi(opts.blockExplorerApiKey)
            const { obj: bscscanAbi } = await bscscan.getAbi(opts.contract)
            this.abi = bscscanAbi
            break
          case 'eth':
            assert(opts.blockExplorerApiKey, 'must have block explorer API key')
            const etherscan = EtherscanApi(opts.blockExplorerApiKey)
            const { obj: etherscanAbi } = await etherscan.getAbi(opts.contract)
            this.abi = etherscanAbi
            break
          default:
            throw new Error(
              `Please provide a valid contract ABI or network we can fetch the ABI.`
            )
        }
      }
      this.web3 =
        providedWeb3 ||
        new Web3(new Web3.providers.WebsocketProvider(opts.wsRpc))
    },

    listen(web3?: Web3) {
      return new Promise(async (resolve, reject) => {
        try {
          if (!this.web3) {
            await this.init(web3)
          }

          assert(this.abi, 'ABI needs to be present to listen for events')
          const contract = new this.web3.eth.Contract(this.abi, opts.contract)

          contract.events[opts.eventName]()
            .on(
              'connected',
              (subscriptionId: string) =>
                opts.onConnect &&
                opts.onConnect(subscriptionId, resolve, reject)
            )
            .on(
              'data',
              (evt: any) => opts.onData && opts.onData(evt, resolve, reject)
            )
            .on(
              'changed',
              (evt: any) =>
                opts.onChanged && opts.onChanged(evt, resolve, reject)
            )
            .on(
              'error',
              (err: any, receipt: any) =>
                opts.onError && opts.onError(err, receipt, resolve, reject)
            )
        } catch (err) {
          reject(err)
        }
      })
    },
  }
}
