// help command
import { ICommand } from "../commands";
import { APIEmbedField, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { submissionDirectory } from "./submit";

const helpCommandName = "help";
const helpCommand: ICommand = {
  name: helpCommandName,
  data: new SlashCommandBuilder()
    .setName(helpCommandName)
    .setDescription("Ask for help"),
  execute: async (interaction) => {
    await interaction.reply(
      "Type in `/submit` to submit something for points! The deadline is New Year's Day at 7:00 AM PST! Good luck!"
    );

    // build a list of the submission point values
    const submissionValueEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("List of Submission Point Values");
    for (const submission of submissionDirectory) {
      const submissionEntry: APIEmbedField = {
        name: `${submission.name}`,
        value: `${submission.points} points\n------------------`,
      };
      submissionValueEmbed.addFields(submissionEntry);
    }
    await interaction.followUp({
      embeds: [submissionValueEmbed],
    });
  },
};

export default helpCommand;
