const isPolicyId = (input) => input.length === 56;

const convertLovelaceToAda = (lovelace) => lovelace / 1_000_000;

const getMinutesAgo = (timestamp) => {
  const now = Date.now();
  const crownedTime = timestamp * 1000;
  const differenceInMs = now - crownedTime;
  const differenceInMinutes = Math.floor(differenceInMs / 1000 / 60);

  return differenceInMinutes;
};

const transformLovelaceToAdaMetrics = (metrics) => {
  return {
    ...metrics,
    marketCap: convertLovelaceToAda(metrics.marketCap).toFixed(0),
    totalVolumeAda: convertLovelaceToAda(metrics.totalVolumeAda).toFixed(0),
    crowned: metrics.crowned ? `<t:${Math.floor(metrics.crowned)}:R>` : null,
  };
};

module.exports = { isPolicyId, transformLovelaceToAdaMetrics };
