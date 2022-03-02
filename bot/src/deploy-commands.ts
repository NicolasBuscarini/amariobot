
import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { AppConfig } from './configs/environment';

const commands = [
	new SlashCommandBuilder().setName('cudecachorro').setDescription('Replies with teu cu em privado!'),
	new SlashCommandBuilder().setName('saveuser').setDescription('Salva um user').addStringOption(option => option.setName('username').setDescription('Enter an username')),
	new SlashCommandBuilder().setName('getuser').setDescription('Obtem um user pelo username').addStringOption(option => option.setName('username').setDescription('Enter an username')),
	new SlashCommandBuilder().setName('loja').setDescription('Use seus ArmarioCredits'),
	new SlashCommandBuilder().setName('creditos').setDescription('Obtém informações sobre seus créditos'),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(AppConfig.TOKEN);
rest.put(Routes.applicationGuildCommands(AppConfig.CLIENT_ID, AppConfig.GUILD_ID), { body: commands, auth: true })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
