// help command
import { ICommand } from "../commands";
import { SlashCommandBuilder } from "discord.js";

const helpCommandName = "help";
const helpCommand: ICommand = {
  name: helpCommandName,
  data: new SlashCommandBuilder()
    .setName(helpCommandName)
    .setDescription("Ask for help"),
  execute: (interaction) => {
    interaction.reply(
      "Type in `/submit` to submit something for points! The deadline is New Year's Day at 7:00 AM PST! Good luck!"
    );
  },
};

export default helpCommand;
