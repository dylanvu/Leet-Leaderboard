import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  CacheType,
} from "discord.js";

import pingCommand from "./commands/ping";
import submitCommand from "./commands/submit";
import helpCommand from "./commands/help";
import leaderboardCommand from "./commands/leaderboard";

export interface ICommand {
  name: string;
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction<CacheType>) => void;
}

// directory of commands to be registered
const commandDirectory: Record<string, ICommand> = {
  ping: pingCommand,
  submit: submitCommand,
  help: helpCommand,
  leaderboard: leaderboardCommand,
};
export default commandDirectory;
