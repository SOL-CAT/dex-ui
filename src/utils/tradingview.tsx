import { USE_MARKETS } from './markets';

export const findTVMarketFromAddress = (marketAddressString: string) => {
  let marketName = '';
  USE_MARKETS.forEach((market) => {
    if (market.address.toBase58() === marketAddressString) {
      marketName = market.name;
    }
  });
  return marketName;
};
