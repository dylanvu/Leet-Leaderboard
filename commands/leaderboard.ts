import { ICommand } from "../commands";
import { SlashCommandBuilder } from "discord.js";

// leaderboard command
const leaderboardCommandName = "leaderboard";
const leaderboardCommand: ICommand = {
  name: leaderboardCommandName,
  data: new SlashCommandBuilder()
    .setName(leaderboardCommandName)
    .setDescription("View the leaderboard"),
  execute: (interaction) => {
    interaction.reply("Not implemented yet.");
    // TODO: create an embed with the leaderboard
  },
};

export default leaderboardCommand;
