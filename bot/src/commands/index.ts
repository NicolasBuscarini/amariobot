import { CacheType, CommandInteraction, Interaction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');

const discordCommands = new Map<String, any>();

discordCommands.set("cudecachorro", async (interaction: CommandInteraction<CacheType>) => {
	await interaction.user.send("ele caga ele caga");
	await interaction.reply("=)");
});

discordCommands.set("saveuser", async (interaction: CommandInteraction<CacheType>) => {
	const username = interaction.options.getString("username");

	if (username === null)
		return await interaction.reply("Coloque um username");
	
	await userService.signUp(new User(username));
	await interaction.reply("user criado");
});

discordCommands.set("getuser", async (interaction: CommandInteraction<CacheType>) => {
	const username = interaction.options.getString("username");

	if (username === null)
		return await interaction.reply("Coloque um username");
	
	const user = await userService.getUserByUsername(username);

	if (user === null)
		return await interaction.reply("Usuário não encontrado");
	
	await interaction.reply(JSON.stringify(user));
});

discordCommands.set("loja", async (interaction: CommandInteraction<CacheType>)=> {

	const exampleEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Loja')
	.setAuthor({ name: 'Armario Ceditos', iconURL: 'https://i.imgur.com/xCH7NyD.png' })
	.setDescription('Loja onde você poderá gastar seus créditos sociais\n\n')
	.setThumbnail('https://i.imgur.com/xCH7NyD.png')
	.addFields(
		{ name: 'Mutar alguem no servidor \n    AR$50,00', value: '/mutar @usuario' },
		{ name: 'Desmutar alguem ou você mesmo \n    AR$50,00', value: '/desmutar @usuario'},
		{ name: 'Alterar apelido de alguém ou de você mesmo \n    A$200,00', value: '/apelido @usuario "Apelido"' },
		{ name: 'Kickar do chat de voz \n    AR$10,00', value: '/kickchat @usuario' },
		{ name: 'Silenciar em algum canal de texto \n    AR$300,00', value: '/silenciar @usuario "canaldetexto"'},
		{ name: 'Silenciar em todos canais de texto \n    AR$1000,00', value: '/silenciarTudo @usuario'},
		{ name: 'Desilenciar alguém ou você mesmo \n    AR$600,00', value: '/desilenciar @usuario'},
	)
	.setImage('https://i.imgur.com/JN1KgNX.png')
	.setTimestamp()
	.setFooter({ text: 'Armario Ceditos', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

	await interaction.reply({ embeds: [exampleEmbed] });
})

export default discordCommands;