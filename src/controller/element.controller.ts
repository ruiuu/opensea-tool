import { Inject, Controller, Get, Post, Body } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { ElementService } from '../service/element.service';

@Controller('/element')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  elementService: ElementService;

  @Get('/home')
  async home(): Promise<string> {
    return 'Hello Midwayjs!';
  }

  @Post('/orders')
  async getSellOrder(@Body() ordersQueryOptions) {
    const { ordersQuery, network } = ordersQueryOptions;
    const orders = await this.elementService.getSellOrders(
      ordersQuery,
      network
    );
    return { success: true, message: 'OK', data: orders };
  }

  @Post('/sellOrder')
  async createSellOrder(@Body() makeOrderParams) {
    const { order, privateKey, network } = makeOrderParams;
    const listing = await this.elementService.createSellOrder(
      order,
      network,
      privateKey
    );
    return { success: true, message: 'OK', data: listing };
  }

  @Post('/fulfillOrder')
  async fulfillOrder(@Body() fillOrderParams) {
    const { order, privateKey, network } = fillOrderParams;
    const response = await this.elementService.fulfillOrder(
      order,
      network,
      privateKey
    );
    return { success: true, message: 'OK', data: response };
  }

  @Post('/cancelOrder')
  async cancelOrder(@Body() fillOrderParams) {
    const { order, privateKey, network } = fillOrderParams;
    const response = await this.elementService.cancelOrder(
      order,
      network,
      privateKey
    );
    return { success: true, message: 'OK', data: response };
  }

}
