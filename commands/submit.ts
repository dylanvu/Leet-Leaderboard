import { ICommand } from "../commands";
import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "discord.js";
import { collection, IUser } from "../firebase";

// command to add points
interface ISubmission {
  name: string;
  subcommandName: string;
  points: number;
  type: "name" | "link" | "description";
  type_description_prompt: string;
  reply_description: string;
}
const submissionDirectory: ISubmission[] = [
  {
    name: "A Job Application",
    subcommandName: "job-application",
    points: 1,
    type: "link",
    type_description_prompt: "Link to the job application",
    reply_description:
      "finished a **Job Application**. Here's where they applied to:",
  },
  {
    name: "1 Hour of Side Project Work Session",
    subcommandName: "side-project-work-session",
    points: 2,
    type: "name",
    type_description_prompt: "Name of the side project",
    reply_description: "**worked on a Side Project**. They worked on:",
  },
  {
    name: "Updating Resume/LinkedIn",
    subcommandName: "resume-linkedin",
    points: 2,
    type: "description",
    type_description_prompt: "What did you change?",
    reply_description:
      "**updated your Resume/LinkedIn**. Here's what they did:",
  },
  {
    name: "A Leetcode Question",
    subcommandName: "leetcode",
    points: 5,
    type: "link",
    type_description_prompt: "Link to the Leetcode question",
    reply_description: "finished **A Leetcode Question**. Here's the question:",
  },
  {
    name: "An OA/Interview for Company",
    subcommandName: "oa-interview",
    points: 10,
    type: "name",
    type_description_prompt: "Name of the company",
    reply_description:
      "completed **An OA/Interview for a Company**. They interviewed with:",
  },
  {
    name: "A Side Project",
    subcommandName: "side-project-completion",
    points: 20,
    type: "link",
    type_description_prompt: "Link to the side project",
    reply_description: "completed **A Side Project**. Here's the side project:",
  },
  {
    name: "The Ultimate Goal: Offer Secured",
    subcommandName: "offer-secured",
    points: 100,
    type: "name",
    type_description_prompt: "Name of the company",
    reply_description:
      "**got an offer**!!! :tada::tada: They secured an offer with:",
  },
];

const submitCommandName = "submit";
const submitCommand: ICommand = {
  name: submitCommandName,
  data: new SlashCommandBuilder()
    .setName(submitCommandName)
    .setDescription("Get points for doing stuff"),
  execute: async (interaction) => {
    // figure out which subcommand was used
    const subcommand = interaction.options.getSubcommand();
    // obtain the number of points for the category
    const submissionType = submissionDirectory.find(
      (submission) => subcommand === submission.subcommandName
    );

    if (submissionType === undefined) {
      await interaction.reply(
        "This is a broken category. Please contact the bot developer."
      );
      return;
    } else {
      // figure out who the user is
      const user = interaction.user;

      // query the database for the user
      const userDoc = await collection.doc(user.id).get();

      let additionalPoints = submissionType.points;

      // use this to reward players for making more progress
      const currentComboMultiplier = 0.1 * submissionType.points;

      // figure out if this is a new user
      if (userDoc.exists) {
        const userDocData = userDoc.data() as IUser;
        // adjust the points by the completion combo
        additionalPoints = additionalPoints * userDocData.completion_combo;
        // update the completion combo
        const newCompletionCombo =
          userDocData.completion_combo + currentComboMultiplier;
        const userPoints = userDocData?.points;
        collection.doc(user.id).update({
          points: userPoints + additionalPoints,
          completion_combo: newCompletionCombo,
        });
      } else {
        // new user
        const userData: IUser = {
          points: additionalPoints,
          username: user.username,
          display_name: user.displayName,
          avatar_url: user.avatarURL() || "none",
          completion_combo: 1 + currentComboMultiplier,
        };
        // if the user doesn't exist, create the user
        collection.doc(user.id).set(userData);
      }

      // format the reply
      const userSubmissionDescription = interaction.options.getString(
        submissionType.type
      );
      // if it's a link, just send only the link without a preview
      const replyText =
        submissionType.type === "link"
          ? "<" + userSubmissionDescription + ">"
          : `**${userSubmissionDescription}**`;

      // reply with a confirmation
      await interaction.reply(
        `**${interaction.user.displayName}**, you ${
          submissionType.reply_description
        } ${replyText}\n**${additionalPoints.toFixed(2)} ${
          additionalPoints === 1 ? "point" : "points"
        } have been added.**`
      );
    }
  },
};

// iterate through the submission directory and add subcommands that prompt for a string/link
submissionDirectory.map((submission: ISubmission) => {
  submitCommand.data.addSubcommand((subcommand) =>
    subcommand
      .setName(submission.subcommandName)
      .setDescription(`Submit ${submission.name}`)
      .addStringOption((option) =>
        option
          .setName(submission.type)
          .setDescription(submission.type_description_prompt)
          .setRequired(true)
      )
  );
});

export default submitCommand;
