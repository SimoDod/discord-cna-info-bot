const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const registerSlashCommands = require("./src/registerSlashCommands.js");
const formatAssetInfo = require("./src/formatAssetInfo.js");
const { ignoredAssetInfoKeys } = require("./src/constants.js");
const { isPolicyId } = require("./src/utils.js");
const subscribeForKothNotifications = require("./src/subscribeForKothNotifications.js");
const api = require("./src/api/api.js");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

registerSlashCommands();

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let kothIntervalId = null;

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  if (commandName === "asset") {
    const assetId = options.getString("asset").trim();

    try {
      let id = assetId;

      if (isPolicyId(assetId)) {
        const response = await api.get(`/assets/policy/${assetId}`);
        id = response.data[0].asset;
      }

      const response = await api.get(`/assets/${id}`);

      await interaction.reply(
        formatAssetInfo(response.data, ignoredAssetInfoKeys).slice(0, 2000)
      );
    } catch (error) {
      console.error(error);
      await interaction.reply("Failed to retrieve asset info.");
    }
  }

  if (commandName === "koth") {
    const subCommand = options.getSubcommand();

    if (subCommand === "start") {
      const channel = client.channels.cache.get(
        process.env.COFFEE_TALKS_CHANNEL
      );

      if (!kothIntervalId) {
        kothIntervalId = subscribeForKothNotifications(channel);
        await interaction.reply("King of the Hill event started!");
      } else {
        await interaction.reply("King of the Hill event is already running!");
      }
    } else if (subCommand === "stop") {
      if (kothIntervalId) {
        clearInterval(kothIntervalId);
        kothIntervalId = null;
        await interaction.reply("King of the Hill event stopped!");
      } else {
        await interaction.reply("King of the Hill event is not running!");
      }
    }
  }
});

client.login(process.env.BOT_TOKEN);
