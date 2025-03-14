import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
import { logger } from "./src/util/logger.js";

const commands = [];
const commandFiles = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = await import(`./src/commands/${file}`);

    if (command.default && command.default.data) {
        commands.push(command.default.data.toJSON());
    } else {
        console.error(`Error in ${file}: Missing data or default export`);
    }
}

const rest = new REST({ version: "9" }).setToken(process.env.TOKEN);

try {
    logger.info("Started refreshing application (/) commands.");

    await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
    );

    logger.success("Successfully reloaded application (/) commands.");
} catch (e) {
    logger.error(e.message);
}