import { SlashCommandBuilder} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { AppConfig } from './configs/environment';

const commands = [
	new SlashCommandBuilder().setName('cudecachorro').setDescription('Replies with teu cu em privado!'),
	new SlashCommandBuilder().setName('getuser').setDescription('Obtém um user pelo username')
		.addUserOption(option => option.setName('usuario').setDescription('pega um usuario')
		.setRequired(false)),
	new SlashCommandBuilder().setName('loja').setDescription('Use seus ArmarioCredits'),
	new SlashCommandBuilder().setName('perfil').setDescription('Visualizar perfil'),
	new SlashCommandBuilder().setName('addcreditos').setDescription('Obtém informações sobre seus créditos')	.addUserOption(option => option.setName('usuario')
		.setDescription('pega um usuario')
		.setRequired(true))
		.addIntegerOption(option => option.setMaxValue(100000).setMinValue(1).setName('valor')
		.setDescription('adiciona ou remove creditos')
		.setRequired(true)),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(AppConfig.TOKEN);
rest.put(Routes.applicationGuildCommands(AppConfig.CLIENT_ID, AppConfig.GUILD_ID), { body: commands, auth: true })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
