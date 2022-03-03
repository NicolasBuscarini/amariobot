import { SlashCommandBuilder} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { AppConfig } from './configs/environment';

const commands = [
	new SlashCommandBuilder().setName('cudecachorro').setDescription('Replies with teu cu em privado!'),

	new SlashCommandBuilder().setName('getuser').setDescription('Obtém informações de um usuario')
		.addUserOption(option => option.setName('usuario').setDescription('pega um usuario')
		.setRequired(false)),

	new SlashCommandBuilder().setName('loja').setDescription('Use seus ArmarioCredits'),

	new SlashCommandBuilder().setName('perfil').setDescription('Visualizar perfil')
	.addUserOption(option => option.setName('usuario').setDescription('mencione um usuario')
	.setRequired(false)),

	new SlashCommandBuilder().setName('addcreditos').setDescription('Obtém informações sobre seus créditos')	.addUserOption(option => option.setName('usuario')
		.setDescription('adiciona créditos a um usuario')
		.setRequired(true))
		.addNumberOption(option => option.setMaxValue(100000).setMinValue(1).setName('valor')
		.setDescription('quantidade de creditos')
		.setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(AppConfig.TOKEN);
rest.put(Routes.applicationGuildCommands(AppConfig.CLIENT_ID, AppConfig.GUILD_ID), { body: commands, auth: true })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
