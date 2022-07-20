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
  network?: 'eth' | 'bsc' | 'polygon' | 'avax' // only needed to support fetching ABI for verified contracts on chain-supported block exporer
  blockExplorerApiKey?: string // only needed if `network` above has a supported block explorer we can fetch verified contract's ABIs for
  wsRpc: string // web-socket RPC connection string to connect for Web3 instance
  contract: string // contract address: 0x...
  contractAbi?: AbiItem[] // custom/manual ABI, only needed if contract is not verified and/or network above is not supported for verified contract ABI fetching
  eventName: string // the contract event we're listening for events for
  onConnect?: onConnect // callback to execute on event listener connection
  onData?: onData // callback to execute on event listener record coming through
  onError?: onError // callback to execute on event listener error
  onChanged?: onChanged // callback to execute on event listener change
}

export type IContractEventReaderOptions =
  IContractEventReaderOptionsOptional & {
    onData: onData
  }

export default function ContractEventReader(
  opts: IContractEventReaderOptionsOptional
) {
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
