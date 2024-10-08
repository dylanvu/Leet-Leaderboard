import { ICommand } from "../commands";
import { SlashCommandBuilder } from "discord.js";
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
export const submissionDirectory: ISubmission[] = [
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
    name: "A Side Project Work Session",
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
    name: "A Hackathon",
    subcommandName: "hackathon",
    points: 10,
    type: "link",
    type_description_prompt: "Link to Devpost/Submission",
    reply_description: "completed **A Hackathon**. Here's their project:",
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

      let userData: IUser;
      if (userDoc.exists) {
        // figure out if this is a new user
        userData = userDoc.data() as IUser;
      } else {
        // create a new user data with defaults
        userData = {
          points: 0,
          username: user.username,
          display_name: user.displayName,
          avatar_url: user.avatarURL() || "none",
          completion_combo: 1,
        };
      }
      // now, perform the point calculations
      // first, calculate the new amount of points using the existing combo
      // the combo multipler is used to reward players for making more progress
      let additionalPoints = submissionType.points * userData.completion_combo;

      // now, increase the combo multiplier for the next submission
      // big number go bigger
      let currentComboMultiplier =
        0.1 * submissionType.points + userData.completion_combo;

      // special case: side project work hours
      let hoursWorked: number | null = 1;
      if (submissionType.subcommandName === "side-project-work-session") {
        // check if there is an extra argument for hours
        hoursWorked = interaction.options.getInteger("hours");
        // make sure the hours inputted are valid
        if (hoursWorked !== null && hoursWorked > 1) {
          // use a for loop to accumulate the combo
          for (let i = 1; i < hoursWorked; i++) {
            // multiply points by new combo multiplier, and add to running total
            additionalPoints += currentComboMultiplier * submissionType.points;
            // increment currentComboMultiplier by one more step
            currentComboMultiplier += 0.1 * submissionType.points;
          }
        }
      }

      // update the modified user data
      if (userDoc.exists) {
        collection.doc(user.id).update({
          points: userData.points + additionalPoints,
          completion_combo: currentComboMultiplier,
        });
      } else {
        userData.points = additionalPoints;
        userData.completion_combo = currentComboMultiplier;
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

      let finalReply = `**${interaction.user.displayName}**, you ${submissionType.reply_description} ${replyText}`;
      // special case:
      // if it's side project submission, add the number of hours at the end
      if (submissionType.subcommandName === "side-project-work-session") {
        finalReply += ` for ${hoursWorked} hour`;
        // plurality of hours
        hoursWorked !== 1 ? (finalReply += "s") : "";
      }
      // reply with a confirmation
      await interaction.reply(
        `${finalReply}\n**${additionalPoints.toFixed(2)} ${
          additionalPoints === 1 ? "point" : "points"
        } have been added.**`
      );
    }
  },
};

// iterate through the submission directory and add subcommands that prompt for a string/link
submissionDirectory.map((submission: ISubmission) => {
  submitCommand.data.addSubcommand((subcommand) => {
    let sub = subcommand
      .setName(submission.subcommandName)
      .setDescription(`Submit ${submission.name}`)
      .addStringOption((option) =>
        option
          .setName(submission.type)
          .setDescription(submission.type_description_prompt)
          .setRequired(true)
      );
    // special case: bulk submit hours
    console.log(submission.subcommandName);
    if (submission.subcommandName === "side-project-work-session") {
      console.log("Registering additional hours option for side project");
      sub.addIntegerOption((option) =>
        option
          .setName("hours")
          .setDescription(
            "How many hours did you work on this? Default/blank is 1 hour."
          )
          .setRequired(false)
      );
    }
    return sub;
  });
});

export default submitCommand;
