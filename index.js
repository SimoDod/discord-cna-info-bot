const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();
const registerSlashCommands = require("./src/registerSlashCommands.js");
const formatAssetInfo = require("./src/formatAssetInfo.js");
const { ignoredAssetInfoKeys } = require("./src/constants.js");
const { isPolicyId } = require("./src/utils.js");
const subscribeForKothNotifications = require("./src/subscribeForKothNotifications.js");
const axios = require("axios");
const api = require("./src/api/api.js");
const { HttpStatusCode } = require("axios");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

registerSlashCommands();

let kothIntervalId = null;
let BOT_ID = null;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  BOT_ID = client.user.id;
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

let conversationHistory = "";

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.mentions.has(BOT_ID)) return;

  const userMessage = message.content.replace(`<@${BOT_ID}>`, "").trim();
  if (!userMessage) return;

  try {
    await message.channel.sendTyping();

    const prompt = `${conversationHistory}User: ${userMessage}\nAssistant:`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "deepseek-r1:70b",
      prompt,
      stream: false,
      max_tokens: 40,
      system: "Keep responses short and concise.",
    });

    if (response.status !== HttpStatusCode.Ok)
      throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.data;

    conversationHistory = `${prompt}${data.response}\n`;

    await message.reply(data.response || "No response from Ollama.");
  } catch (error) {
    console.error("Error with local AI:", error);
    await message.reply("Sorry, I couldn't generate a response.");
  }
});

client.login(process.env.BOT_TOKEN);
