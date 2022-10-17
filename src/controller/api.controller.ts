import {
  Inject,
  Controller,
  Get,
  Query,
  Post,
  Body,
} from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';
import { SeaPortService } from '../service/seaport.service';

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  seaPortService: SeaPortService;

  @Get('/get_test')
  async getTest(@Query('privateKey') privateKey: string) {
    const test = await this.seaPortService.getTest(privateKey);
    return { success: true, message: 'OK', data: test };
  }

  @Post('/sellOrder')
  async createSellOrder(@Body() order) {
    const { privateKey } = order;
    delete order.privateKey;
    const listing = await this.seaPortService.createSellOrder(
      order,
      privateKey
    );
    return { success: true, message: 'OK', data: listing };
  }

  @Post('/fulfillOrder')
  async fulfillOrder(@Body() order) {
    const { privateKey } = order;
    delete order.privateKey;
    const response = await this.seaPortService.fulfillOrder(order, privateKey);
    return { success: true, message: 'OK', data: response };
  }

  @Post('/orders')
  async getSellOrder(@Body() ordersQueryOptions) {
    const orders = await this.seaPortService.getSellOrders(ordersQueryOptions);
    return { success: true, message: 'OK', data: orders };
  }
}
