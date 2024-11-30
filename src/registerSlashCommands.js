const { REST, Routes } = require("discord.js");

const commands = [
  {
    name: "asset",
    description: "Retrieve asset info.",
    options: [
      {
        name: "asset",
        type: 3,
        description: "The ID of the asset",
        required: true,
      },
    ],
  },
  {
    name: "koth",
    description: "King of the Hill command to start or stop.",
    options: [
      {
        name: "start",
        type: 1,
        description: "Start the King of the Hill event",
        options: [],
      },
      {
        name: "stop",
        type: 1,
        description: "Stop the King of the Hill event",
        options: [],
      },
    ],
  },
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

const registerSlashCommands = async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
};

module.exports = registerSlashCommands;
