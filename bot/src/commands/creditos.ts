import { CacheType, CommandInteraction } from "discord.js";
import { User } from "../models/user.model";
import { userService } from "../services/user.service";
const { MessageEmbed } = require('discord.js');

const discordCreditosCommands = new Map<string, any>();

discordCreditosCommands.set("doarcreditos", async (currentUser: User, interaction: CommandInteraction<CacheType>) => {
	const discordUserAlvo = interaction.options.getUser('usuario')!; 
	const creditos = interaction.options.getNumber('valor')!; 

	if(creditos <= 0) {
		return  interaction.reply({content: "Safado!!! Valor igual ou menor que 0 não pode...", ephemeral: true});
	}
	
	if ( !await userService.gastarCreditos(currentUser, creditos) ) {
		return await interaction.reply({content: "Você tentou doar mais créditos do que você possui. \nUse /perfil para ver seus créditos.", ephemeral: true});
	}

	const applicationUserAlvo = await userService.getOrCreateUserByUserId(discordUserAlvo.id);
	userService.adicionaCreditos(applicationUserAlvo, creditos);
	return await interaction.reply(`<@!${currentUser.userid}> doou AR\$${creditos} para <@!${applicationUserAlvo.userid}>. Agradeça`);
});

discordCreditosCommands.set("addcreditos", async (currentUser: User,  interaction: CommandInteraction<CacheType>)=> {
	let input = interaction.options.getUser('usuario')!; 
	const user = await userService.getOrCreateUserByUserId(input.id);

	const valor = interaction.options.getNumber('valor')!;
	await userService.adicionaCreditos(user, valor);
	await interaction.reply(`Adicionado AR\$${valor} para <@!${user.userid}> .`);
})

export default discordCreditosCommands;