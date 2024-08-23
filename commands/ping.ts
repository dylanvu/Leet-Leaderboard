import { ICommand } from "../commands";
import { SlashCommandBuilder } from "discord.js";

const pingCommandName = "ping";
const pingCommand: ICommand = {
  name: pingCommandName,
  data: new SlashCommandBuilder()
    .setName(pingCommandName)
    .setDescription("Replies with Pong!"),
  execute: (interaction) => {
    interaction.reply("Pong!");
  },
};

export default pingCommand;
