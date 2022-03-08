import { CacheType, CommandInteraction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');
import progressbar from "string-progressbar";


const discordCommands = new Map<string, any>();

discordCommands.set("cudecachorro", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	// Assaign values to total and current values
	var total = 100;
	var current = 50;
	// First two arguments are mandatory
	const teste = progressbar.splitBar(total, current);
	// Returns: Array<String, String>
	
	await interaction.user.send("ele caga, ele caga");
	await interaction.reply(`${teste}`);
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
	let today = new Date(Date.now());
	today.setUTCHours(today.getHours() +3);
	let lastDaily = currentUser.daily;

	if (lastDaily > 0) {
		let dailyDate = new Date(lastDaily);
		if (today.getDate() == dailyDate.getDate() 
		&& today.getMonth() == dailyDate.getMonth() 
		&& today.getFullYear() == dailyDate.getFullYear()) {
			return interaction.reply({content: 'Você já pegou o premio hoje. Volte amanhã!', ephemeral: true});
		}
	};
	
	await userService.adicionaCreditos(currentUser, 40);
	await userService.updateUser(currentUser, {daily: Date.now()});
	return interaction.reply("Parabens, otário! você ganhou AR$40,00 por logar hoje.")
});

export default discordCommands;