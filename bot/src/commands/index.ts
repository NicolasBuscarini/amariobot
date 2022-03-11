import { CacheType, CommandInteraction, MessageActionRow, MessageEmbed, MessageSelectMenu } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
import progressbar from "string-progressbar";

const discordCommands = new Map<string, any>();

discordCommands.set("cudecachorro", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	var total = 100;
	var current = 50;
	const teste = progressbar.splitBar(total, current);
	
	await interaction.user.send("ele caga, ele caga");
	await interaction.reply(`${teste}`);
});

discordCommands.set("ranking", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	let embed = new MessageEmbed()
		.setColor('#0099ff')
		.setURL('https://discord.js.org/')
		.setTitle(`Ranking`)
		.addFields(
		)

	const menu = new MessageActionRow()
	.addComponents(
		new MessageSelectMenu()
			.setCustomId('select')
			.setPlaceholder('Selecione um ranking')
			.addOptions([
				{
					label: 'exp',
					description: 'This is a description',
					value: 'first_option',
				},
				{
					label: 'creditos',
					description: 'This is also a description',
					value: 'second_option',
				},
			]),
	);
	
	await interaction.reply({ embeds: [embed], components: [menu]});

	userService.listRank("exp");
	
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
	return interaction.reply("Parabéns, otário! você ganhou AR$40,00 por logar hoje.")
});

export default discordCommands;