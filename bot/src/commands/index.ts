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

discordCommands.set("daily" , async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	console.log(Date.now());
	let today = new Date(Date.now());
	let lastDaily = currentUser.daily;

	if (lastDaily > 0) {
		let dailyDate = new Date(lastDaily);
		if (today.getDate() == dailyDate.getDate() 
		&& today.getMonth() == dailyDate.getMonth() 
		&& today.getFullYear() == dailyDate.getFullYear()) {
			return interaction.reply({content: 'Você já pegou o premio hoje. Volte amanhã!', ephemeral: true});
		}
	};

	await userService.adicionaCreditos(currentUser, 30);
	await userService.updateUser(currentUser, {daily: Date.now()});
	return interaction.reply("Parabens, otário! você ganhou AR$30,00 por logar hoje.")
});

export default discordCommands;