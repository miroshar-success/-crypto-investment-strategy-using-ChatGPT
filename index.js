const Binance = require('node-binance-api');

const binance = new Binance().options({
    'family': 4,
    useServerTime: true
});

const LAST_HOUR_CANDLER = 7;
const CANDLE_DIMENSION = '1d';

binance.candlesticks("BTCUSDT", CANDLE_DIMENSION, (error, ticks, symbol) => {
    if (error) {
        throw error;
    }
    const candles = ticks.map(([time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored]) => {
        return {
            low,
            high,
            close,
            closeTime: new Date(closeTime).toISOString(),
        };
    })
    console.log(candles);
  }, {limit: LAST_HOUR_CANDLER});
