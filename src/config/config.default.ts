import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1656919035266_2170',
  koa: {
    port: 7001,
  },

  environmentConfigs: {
    production: '',
    test: 'https://rinkeby.infura.io/v3/8c75c46842ac4028916be907cdcfb007',
    openseaApi: '',
  },

  elementConfigs: {
    production: 'https://bsc-dataseed.binance.org/',
    test: 'https://data-seed-prebsc-2-s1.binance.org:8545/',
    elementApi: '181563ae1f25f9fcfe5a64ba49529fbf',
  }

  // httpProxy: {
  //   match: /\/opensea\//,
  //   host: 'https://127.0.0.1:7890',
  // },
} as MidwayConfig;
