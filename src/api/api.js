const axios = require("axios");

const api = axios.create({
  baseURL: "https://cardano-mainnet.blockfrost.io/api/v0",
  headers: { Project_id: process.env.BLOCKFROST_API_KEY },
});

module.exports = api;
