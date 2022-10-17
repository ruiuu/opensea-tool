import { Provide, Inject, Init, Config } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import {
  ElementSDK,
  MakeOrderParams,
  Network,
  OrderQuery,
} from 'element-js-sdk';
import { ethers} from 'ethers';

@Provide()
export class ElementService {
  private jsonRpcProvider;
  private signer;
  private elemnetSDK: ElementSDK;
  private elementApi: string;
  private production: string;
  private test: string;

  @Config('elementConfigs')
  elementConfigs: any;

  @Inject()
  ctx: Context;

  @Init()
  async init() {
    const { production, test, elementApi } = this.elementConfigs;
    this.test = test;
    this.production = production;
    this.elementApi = elementApi;
  }

  async getSellOrders(OrderQuery: OrderQuery, network: string) {
    let currentNetwork = network == 'main' ? this.production : this.test;
    this.jsonRpcProvider = new ethers.providers.JsonRpcProvider(currentNetwork);

    this.elemnetSDK = new ElementSDK({
      networkName: Network.BSC,
      isTestnet: network !== 'main',
      apiKey: this.elementApi,
      signer: this.jsonRpcProvider,
    });

    const { orders } = await this.elemnetSDK.queryOrders(OrderQuery);
    return orders;
  }

  async createSellOrder(
    makeOrderParams: MakeOrderParams,
    network: string,
    privateKey: string
  ) {
    
    this.updateEnvironment(privateKey, network);
    const listing = await this.elemnetSDK.makeSellOrder(makeOrderParams);
    return listing;
  }

  async fulfillOrder(fillOrderParams, network: string, privateKey: string) {
    this.updateEnvironment(privateKey, network);
    const response = await this.elemnetSDK.fillOrder({
      order: fillOrderParams,
    });
    return response;
  }

  async cancelOrder(fillOrderParams, network: string, privateKey: string) {
    this.updateEnvironment(privateKey, network);
    const transactionReceipt = await this.elemnetSDK.cancelOrder({
      order: fillOrderParams
    });
    return transactionReceipt
  }

  updateEnvironment(privateKey: string, network: string) {
    const currentNetwork = network == 'main' ? this.production : this.test;
    const jsonRpcProvider = new ethers.providers.JsonRpcProvider(currentNetwork);
    this.signer = new ethers.Wallet(privateKey, jsonRpcProvider);
    this.elemnetSDK = new ElementSDK({
      networkName: Network.BSC,
      isTestnet: true,
      apiKey: this.elementApi,
      signer: this.signer,
    });
  }
}
