import { Provide, Inject, Init, Config } from '@midwayjs/decorator';
import { OpenSeaPort, Network } from 'opensea-js';
import { Asset } from 'opensea-js/lib/types';
import { Context } from '@midwayjs/koa';
import { BigNumberInput } from 'opensea-js/lib/utils/utils';
import { OrdersQueryOptions, OrderV2 } from 'opensea-js/lib/orders/types';
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');

@Provide()
export class SeaPortService {
  private _provider;
  private _openSeaPort: OpenSeaPort;
  private _currentEnvironment;
  private _production;
  private _openseaApi;

  @Config('environmentConfigs')
  environmentConfigs: any;

  @Inject()
  ctx: Context;

  @Init()
  async init() {
    const { production, test, openseaApi } = this.environmentConfigs;
    this._production = production;
    this._openseaApi = openseaApi;
    this._currentEnvironment = production || test;
  }

  async getTest(privateKey: string) {
    this.updateEnvironment(privateKey);
    return 'test';
  }

  /**
   * @param side: //"bid" 买单， "ask" 卖单
   * @param protocol?: "seaport"; 订单协议（未来可能会添加更多选项）
   * @param maker?: string, //订单创建者的地址
   * @param taker?: string, // 如果允许任何人接受订单，则为空地址
   * @param owner?: string, // 订单商品所有者的地址
   * @param sale_kind?: SaleKind, // 0 为固定价格，1 为荷兰式拍卖
   * @param assetContractAddress?: string, // 订单商品的合同地址
   * @param paymentTokenAddress?: string; // 订单支付代币的合约地址
   * @param tokenId?: number | string,
   * @param tokenIds?: Array<number | string>,
   * @param listedAfter?: number | string, // 这意味着 Listing_time > 以秒为单位的值
   * @param listedBefore?: number | string, // 这意味着 Listing_time <= 以秒为单位的值
   * @param orderBy?: "created_date" | "eth_price", // 结果排序依据的字段
   * @param orderDirection?: "asc" | "desc", // 排序方向按结果排序
   * @param onlyEnglish?: boolean, // 只退回英文拍卖订单
   // 分页
   * @param limit?: number,
   * @param offset?: number,
   */
  async getSellOrders(OrdersQueryOptions: Omit<OrdersQueryOptions, 'limit'>) {
    this._provider = new Web3.providers.HttpProvider(this._currentEnvironment);
    this._openSeaPort = new OpenSeaPort(this._provider, {
      networkName: this._production ? Network.Main : Network.Rinkeby,
      apiKey: this._openseaApi,
    });
    const { orders } = await this._openSeaPort.api.getOrders(
      OrdersQueryOptions
    );
    return orders;
  }

  /**
   * 创建卖单以拍卖资产。
   * @param options 创建卖单的选项
   * @param options.asset 要交易的资产
   * @param options.accountAddress 制造商钱包地址
   * @param options.startAmount 拍卖开始时资产的价格。单位是代币小数位以上的代币数量（整数部分）。例如，对于以太币，预期单位是 ETH，而不是 wei。
   * @param options.endAmount 资产在到期时间结束时的可选价格。单位是代币小数位（整数部分）上方的代币数量。例如，对于以太币，预期单位是 ETH，而不是 wei。
   * @param options.quantity 要出售的资产数量（如果可替代或半可替代）。默认为 1。以单位为单位，而不是基本单位，例如不是伟。
   * @param options.listingTime 订单可以履行的可选时间，以 UTC 秒为单位。未定义意味着它将现在开始。
   * @param options.expirationTime 订单的到期时间，以 UTC 秒为单位。
   * @param options.paymentTokenAddress 要接受的 ERC-20 代币的地址。如果未定义或为空，则使用
   * @param options.buyerAddress 允许购买此项目的可选地址。如果指定，则没有其他地址能够接受该订单，除非其值为空地址。
   */
  // 创建一个卖单
  async createSellOrder(
    order: {
      asset: Asset;
      accountAddress: string;
      startAmount: BigNumberInput;
      endAmount?: BigNumberInput;
      quantity?: BigNumberInput;
      listingTime?: string;
      expirationTime?: BigNumberInput;
      paymentTokenAddress?: string;
      buyerAddress?: string;
    },
    privateKey: string
  ) {
    this.updateEnvironment(privateKey);
    const listing = await this._openSeaPort.createSellOrder(order);
    return listing;
  }

  /**
   * 完成或“接受”资产订单，买入或卖出订单
   * @param options 填充选项
   * @param options.order 要履行的订单，也就是“接受”
   * @param options.accountAddress 接受者的钱包地址
   * @param options.recipientAddress 接收订单商品或货币的可选地址。如果未指定，默认为 accountAddress
   * @returns 完成订单的交易哈希
   */
  async fulfillOrder(
    orderInfo: {
      order: OrderV2;
      accountAddress: string;
      recipientAddress?: string;
    },
    privateKey: string
  ) {
    this.updateEnvironment(privateKey);
    const response = await this._openSeaPort.fulfillOrder(orderInfo);
    return response;
  }

  // 创建一个offer
  async createBuyOrder(
    order: {
      asset: Asset;
      accountAddress: string;
      startAmount: BigNumberInput;
      quantity?: BigNumberInput;
      expirationTime?: BigNumberInput;
      paymentTokenAddress?: string;
    },
    privateKey: string
  ) {
    this.updateEnvironment(privateKey);
    const offer = await this._openSeaPort.createBuyOrder(order);
    return offer;
  }

  // 取消订单
  async cancelOrder(
    order: OrderV2,
    accountAddress: string,
    privateKey: string
  ) {
    this.updateEnvironment(privateKey);
    const cancel = await this._openSeaPort.cancelOrder({
      order,
      accountAddress,
    });
    return cancel;
  }

  updateEnvironment(privateKey: string) {
    this._provider = new HDWalletProvider(
      [privateKey],
      this._currentEnvironment
    );
    this._openSeaPort = new OpenSeaPort(this._provider, {
      networkName: this._production ? Network.Main : Network.Rinkeby,
      apiKey: this._openseaApi,
    });
  }
}
