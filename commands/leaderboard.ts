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

    for (const user of leaderboard) {
      const userEntry: APIEmbedField = {
        name: user.display_name,
        value: `${user.points.toString()} points`,
      };
      leaderboardEmbed.addFields(userEntry);
    }

    // reply
    await interaction.reply({ embeds: [leaderboardEmbed] });
  },
};

export default leaderboardCommand;
