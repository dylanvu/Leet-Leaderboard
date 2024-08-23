import { ICommand } from "../commands";
import { SlashCommandBuilder } from "discord.js";

// command to add points
interface ISubmission {
  name: string;
  points: number;
  value: string; // value should match the name of the category cuz that's how my code works :P
}
const submissionDirectory = [
  { name: "Job Application", points: 1, value: "Job Application" },
  {
    name: "Side Project Work Session",
    points: 2,
    value: "Side Project Work Session",
  },
  { name: "Leetcode Question", points: 5, value: "Leetcode Question" },
  {
    name: "OA/Interview for Company",
    points: 10,
    value: "OA/Interview for Company",
  },
  {
    name: "Side Project",
    points: 20,
    value: "Side Project",
  },
  {
    name: "The Ultimate Goal: Offer Secured",
    points: 100,
    value: "The Ultimate Goal: Offer Secured",
  },
];
const submitCommandName = "submit";
const submitCommand: ICommand = {
  name: submitCommandName,
  data: new SlashCommandBuilder()
    .setName(submitCommandName)
    .setDescription("Get points for doing stuff")
    .addStringOption((option) =>
      option
        .setName("category")
        .setDescription("Choose a category to submit to")
        .setRequired(true)
        .addChoices(
          submissionDirectory.map((submission: ISubmission) => {
            return { name: submission.name, value: submission.value };
          })
        )
    ),
  execute: (interaction) => {
    interaction.options.getString("category");
    // obtain the number of points for the category
    const submissionType = submissionDirectory.find(
      (submission) =>
        submission.value === interaction.options.getString("category")
    );

    if (submissionType === undefined) {
      interaction.reply(
        "This is a broken category. Please contact the bot developer."
      );
      return;
    } else {
      interaction.reply(
        `**${interaction.options.getString("category")}** finished! **${
          submissionType.points
        } points have been added.**`
      );
    }
  },
};

export default submitCommand;
