import { CacheType, CommandInteraction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');

const discordCreditosCommands = new Map<string, any>();

discordCreditosCommands.set("loja", async (currentUser: User,  interaction: CommandInteraction<CacheType>)=> {
	const exampleEmbed = new MessageEmbed()
	.setColor('#0099ff')
	.setTitle('Loja')
	.setAuthor({ name: 'Armario Creditos', iconURL: 'https://i.imgur.com/xCH7NyD.png' })
	.setDescription('Loja onde você poderá gastar seus créditos sociais\n\n')
	.setThumbnail('https://i.imgur.com/xCH7NyD.png')
	.addFields(
		{ name: '\nMutar alguem no servidor (:x:  infuncionando)\n\t\tAR$50,00', value: '/mutar @usuario' },
		{ name: 'Desmutar alguem ou você mesmo (:x:  infuncionando)\n\t\tAR$50,00', value: '/desmutar @usuario'},
		{ name: 'Alterar apelido de alguém ou de você mesmo (:x:  infuncionando)\n\t\tA$200,00', value: '/apelido @usuario "Apelido"' },
		{ name: 'Kickar do chat de voz (:white_check_mark: funcionando) \n\t\tAR$10,00', value: '/kickar @usuario' },
		{ name: 'Silenciar em algum canal de texto (:x:  infuncionando)\n\t\tAR$300,00', value: '/silenciar @usuario "canaldetexto"'},
		{ name: 'Silenciar em todos canais de texto (:x:  infuncionando)\n\t\tAR$1000,00', value: '/silenciarTudo @usuario'},
		{ name: 'Desilenciar alguém ou você mesmo (:x:  infuncionando)\n\t\tAR$600,00', value: '/desilenciar @usuario'}
	)
	.setImage('https://i.imgur.com/UKK6OCb.png')
	.setTimestamp()
	.setFooter({ text: 'Armario Creditos', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

	await interaction.reply({ embeds: [exampleEmbed] });
})

discordCreditosCommands.set("addcreditos", async (currentUser: User,  interaction: CommandInteraction<CacheType>)=> {
	let input = interaction.options.getUser('usuario')!; 
	const user = await userService.getOrCreateUserByUserId(input.id);

	const valor = interaction.options.getNumber('valor')!;
	await userService.mudarCreditos(user, valor);
	console.log(user);
	await interaction.reply(`Adicionado AR\$${valor} para <@!${user.userid}> .`);
})

export default discordCreditosCommands;