import fs from "fs";
import path from "path";
import { Client, GatewayIntentBits , Collection, ActivityType } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { logger } from "./src/util/logger.js";

const client = new Client({
    ws: { properties: { browser: 'Discord iOS' }},
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.resolve(`./src/commands/${file}`);
    const command = await import(`file://${filePath}`);

    if (command.default && command.default.data) {
        client.commands.set(command.default.data.name, command.default);
    } else {
        logger.error(`Error loading command at ${filePath}: Missing data or default export`);
    }
}

client.once("ready", async() => {
    logger.info(`Logged in as: ${client.user.tag}`);
    client.user.setPresence({
        activities: [{ name: `/random-image`, type: ActivityType.Watching }],
        status: 'dnd',
    });
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (e) {
        logger.error(e);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(process.env.TOKEN);