import { Client, Events, GatewayIntentBits } from "discord.js";
import { configDotenv } from "dotenv";
import commandDirectory from "./commands";
import express from "express";
import { Logging } from "@google-cloud/logging";

const logger = new Logging();

try {
  configDotenv();
  const TOKEN = process.env.TOKEN;

  const APP = express();
  const PORT: number = 3000;

  APP.get("/", (req: any, res: any) => res.send("App Engine Bot!"));
  APP.listen(PORT, () =>
    console.log(`Discord bot app listening at http://localhost:${PORT}`)
  );

  const client = new Client({
    intents: GatewayIntentBits.Guilds,
  });

  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);

    // Register commands
    // commandDirectory is an object with values as ICommand objects
    // turn the object into an array of ICommand objects
    const commands = Object.values(commandDirectory);
    // map to data to set commands
    const commandsData = commands.map((command) => command.data);
    client.application?.commands.set(commandsData);
  });

  client.on(Events.InteractionCreate, (interaction) => {
    try {
      if (!interaction.isChatInputCommand()) return;
      console.log(interaction);

      // Get the command object from the commandDirectory
      const command = commandDirectory[interaction.commandName];
      if (!command) {
        interaction.reply("Something went wrong!");
      }

      // Execute the command
      command.execute(interaction);
    } catch (error) {
      logger.log("interactionCreate error: " + error);
    }
  });

  // Log in to Discord with your client's token
  client.login(TOKEN);
} catch (error) {
  console.log(error);
  logger.log("General error: " + error);
}
