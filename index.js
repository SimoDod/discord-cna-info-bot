const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const registerSlashCommands = require("./src/registerSlashCommands.js");
const formatAssetInfo = require("./src/formatAssetInfo.js");
const { isPolicyId } = require("./src/utils.js");
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

      await interaction.reply(formatAssetInfo(response.data));
    } catch (error) {
      console.error(error);
      await interaction.reply("Failed to retrieve asset info.");
    }
  }
});

client.login(process.env.BOT_TOKEN);
