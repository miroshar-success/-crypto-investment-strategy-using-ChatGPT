import Module from "node:module";
import { createCompletion, loadModel } from "gpt4all";

const require = Module.createRequire(import.meta.url);

const Binance = require('node-binance-api');

const binance = new Binance().options({
    'family': 4,
    useServerTime: true
});

const LAST_HOUR_CANDLER = 7;
const CANDLE_DIMENSION = '1d';

console.log('Initializing model');

const model = await loadModel("Nous-Hermes-2-Mistral-7B-DPO.Q4_0.gguf");

const getCandles = () => new Promise((res, rej) => {
    binance.candlesticks("BTCUSDT", CANDLE_DIMENSION, (error, ticks) => {
        if (error) {
            rej(error);
            return;
        }
        res(ticks.map(([time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored]) => ({
            low,
            high,
            close,
            closeTime: new Date(closeTime).toISOString(),
        })));
    }, { limit: LAST_HOUR_CANDLER });
});

console.log('Fetching cryptocurrency candles')

const candles = await getCandles();

const SYSTEM_PROMPT = [
    'You are a cryptocurrency trader. Write a strategy about long term and short term investments',
    'Do not ask for specific information, the candles data is all you have',
    `The last 7 days cryptocurrency candles: ${JSON.stringify(candles)}`,
    'Predict: UP or DOWN (no other information).',
].join('\n');

console.log('Initializing chat');

const chat = await model.createChatSession({
    temperature: 0.8,
    systemPrompt: `### System:\n${SYSTEM_PROMPT}\n\n`,
});

console.log('Generating answer');

console.time('Timing');
const responce = await createCompletion(chat, 'Should I place a limit buy order at the midpoint price?');
console.timeEnd('Timing');

console.log(candles);
console.log();
console.log(responce.choices[0].message.content);

await model.dispose();
