import { CacheType, CommandInteraction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');

const discordCommands = new Map<string, any>();

discordCommands.set("cudecachorro", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	await interaction.user.send("ele caga, ele caga");
	await interaction.reply("=D");
});

discordCommands.set("getuser", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	let input = interaction.options.getUser('usuario'); 
	let user : User;
	if (input !== null) {
		const userInput = await userService.getOrCreateUserByUserId(input.id);
		user = userInput;
	} else {
		user = currentUser;
	}
	await interaction.reply({content: JSON.stringify(user), ephemeral: true});
});

export default discordCommands;