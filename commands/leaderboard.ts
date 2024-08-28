import { ICommand } from "../commands";
import { SlashCommandBuilder, EmbedBuilder, APIEmbedField } from "discord.js";
import { collection, IUser } from "../firebase";

// leaderboard command
const leaderboardCommandName = "leaderboard";
const leaderboardCommand: ICommand = {
  name: leaderboardCommandName,
  data: new SlashCommandBuilder()
    .setName(leaderboardCommandName)
    .setDescription("View the leaderboard"),

  execute: async (interaction) => {
    const leaderboard: IUser[] = [];

    // obtain a list of all the users in the collection
    // then, display the users in the leaderboard
    await collection
      .orderBy("points", "desc")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          leaderboard.push(doc.data() as IUser);
        });
      });

    // convert the leaderboard to an embed
    const leaderboardEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("Top Leaderboard");

    if (leaderboard.length === 0) {
      leaderboardEmbed.setDescription("No users in the leaderboard yet.");
    } else {
      // iterate through the leaderboard and index, add the user to the embed
      leaderboard.map((user, index) => {
        const userEntry: APIEmbedField = {
          name: `${index + 1}. ${user.display_name}`,
          value: `**Points:**\n${user.points
            .toFixed(2)
            .toString()} points\n**Completion Combo:**\n${user.completion_combo
            .toFixed(2)
            .toString()}x\n------------------`,
        };
        leaderboardEmbed.addFields(userEntry);
        if (
          index === 0 &&
          user.avatar_url &&
          user.avatar_url !== "none" &&
          user.avatar_url.length > 0
        ) {
          leaderboardEmbed.setThumbnail(user.avatar_url);
        }
      });
    }

    // reply
    await interaction.reply({ embeds: [leaderboardEmbed] });
  },
};

export default leaderboardCommand;
