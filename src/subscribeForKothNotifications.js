const axios = require("axios").default;
const { transformLovelaceToAdaMetrics } = require("./utils.js");
const formatAssetInfo = require("./formatAssetInfo.js");
const api = require("./api/api.js");

const subscribeForKothNotifications = (channel) => {
  let oldId = "";

  const intervalId = setInterval(async () => {
    try {
      const response = await axios.get(
        "https://analytics-snekfun.splash.trade/ws-http/v1/snekfun/koth"
      );
      const newId = response.data.pool.id;
      const assetId = response.data.pool.y.asset;
      const assetIdNoDot = assetId.split(".").join("");

      const tokenDataResponse = await api.get("/assets/" + assetIdNoDot);
      const { ticker, name } = tokenDataResponse.data.onchain_metadata;

      if (oldId !== newId) {
        oldId = newId;
        const convertedMetrics = transformLovelaceToAdaMetrics(
          response.data.metrics
        );
        channel.send(
          `New KOTH: \`\`\`Ticker: ${ticker.toUpperCase()}; Name: ${name};\`\`\` \n${formatAssetInfo(
            convertedMetrics
          )}**AssetId:** ${assetIdNoDot} \nhttps://snek.fun/token/${assetId}`
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, 4000);

  return intervalId;
};

module.exports = subscribeForKothNotifications;

// {
//     "pool": {
//       "id": "63f947b8d9535bc4e4ce6919e3dc056547e8d30ada12f29aa5f826b8.52ffa89d0d4e2f39646326f38051853d43dea52119cce8c954b377e1aef6d37c",
//       "x": {
//         "asset": ".",
//         "amount": "1247500000"
//       },
//       "y": {
//         "asset": "7c99530d8b25dd2598b3da455b878e1da7a10a211e721b312d846317.46726579612043617264616e6f",
//         "amount": "677416285"
//       },
//       "outputId": {
//         "transactionId": "0529a370a6acaf965a735d2efb9f05eb8f4e7eedc757040f2ccf4fd758e3f11e",
//         "transactionIndex": 1
//       },
//       "aNum": 74737329614,
//       "bNum": 1274818,
//       "adaCapThreshold": 10988175000,
//       "poolAuthor": "f3eb6acd3be0ed7cc36a8824fd0208c6226c79c9da02942049d0b0c5",
//       "launchType": "",
//       "createdOn": 1725544035,
//       "permittedExecutor": "77aad104164cc47762302067aabe64678b6ed1a8a5e4e47bb1509f0a",
//       "cpmmPoolId": null,
//       "version": "v1",
//       "timestamp": 1725544081
//     },
//     "metrics": {
//       "marketCap": 9052003442,
//       "totalVolumeAda": 0,
//       "totalTxCount": 3,
//       "crowned": null
//     }
//   }
// https://analytics-snekfun.splash.trade/ws-http/v1/snekfun/koth
