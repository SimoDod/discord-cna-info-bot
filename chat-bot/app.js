const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
require("dotenv").config();
const { HttpStatusCode } = require("axios");
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

let BOT_ID = null;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  BOT_ID = client.user.id;
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.mentions.has(BOT_ID)) return;

  const userMessage = message.content.replace(`<@${BOT_ID}>`, "").trim();
  if (!userMessage) return;

  try {
    await message.channel.sendTyping();

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3",
      prompt: userMessage,
      stream: false,
      max_tokens: 40,
      system: "Keep responses short and concise.",
    });

    if (response.status !== HttpStatusCode.Ok)
      throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.data;

    await message.reply(data.response || "No response from Ollama.");
  } catch (error) {
    console.error("Error with local AI:", error);
    await message.reply("Sorry, I couldn't generate a response.");
  }
});

client.login(process.env.BOT_TOKEN);
