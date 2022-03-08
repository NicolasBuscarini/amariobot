import { SlashCommandBuilder} from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { AppConfig } from './configs/environment';
import options from './configs/mongo.config';

const commands = [
	new SlashCommandBuilder().setName('cudecachorro').setDescription('Replies with teu cu em privado!'),

	new SlashCommandBuilder().setName('daily').setDescription('Créditos por logar diariamente.'),

	new SlashCommandBuilder().setName('kickar').setDescription('Desconecta uma pessoa do chat de voz por AR$20,00')
		.addUserOption(option => option.setName('alvo')
			.setDescription('alvo para kickar do chat de voz')
			.setRequired(true)
		),

	new SlashCommandBuilder().setName('doarcreditos').setDescription('Doar seus créditos para uma pessoa')
		.addUserOption(option => option.setName('usuario')
			.setDescription('adiciona créditos a um usuario')
			.setRequired(true)
		)
		.addNumberOption(option => option.setMaxValue(100000).setMinValue(1).setName('valor')
			.setDescription('quantidade de creditos')
			.setRequired(true)
		),

	new SlashCommandBuilder().setName('apelido').setDescription('Mude o apelido de um alvo por AR$200,00')
		.addUserOption(option => option.setName('alvo')
			.setDescription('Selecione um alvo')
			.setRequired(true)
		)
		.addStringOption(option => option.setName('apelido')
			.setDescription('Defina o novo apelido do alvo')
			.setRequired(true)
		),

	new SlashCommandBuilder().setName('castigo').setDescription('Dar castigo a um alvo por 5 min por AR$50,00')
		.addUserOption(option => option.setName('alvo')
			.setDescription('Selecione um alvo')
			.setRequired(true)
		),
	
	new SlashCommandBuilder().setName('silenciar').setDescription('Silenciar um alvo do chat de voz por AR$250,00')
		.addUserOption(option => option.setName('alvo')
			.setDescription('Selecione um alvo')
			.setRequired(true)
		),

	new SlashCommandBuilder().setName('getuser').setDescription('Obtém informações de um usuario')
		.addUserOption(option => option.setName('usuario')
			.setDescription('pega um usuario')
			.setRequired(false)
		),

	new SlashCommandBuilder().setName('loja').setDescription('Use seus ArmarioCredits'),

	new SlashCommandBuilder().setName('perfil').setDescription('Visualizar perfil')
		.addUserOption(option => option.setName('usuario')
			.setDescription('mencione um usuario')
			.setRequired(false)
		),

	new SlashCommandBuilder().setName('addcreditos').setDescription('Adiciona creditos a um usuario. Apenas ADM')
		.addUserOption(option => option.setName('usuario')
			.setDescription('adiciona créditos a um usuario')
			.setRequired(true)
		)
		.addNumberOption(option => option.setMaxValue(100000).setMinValue(1).setName('valor')
			.setDescription('quantidade de creditos')
			.setRequired(true)
		)
		.addStringOption(option => option.setName("motivo")
			.setDescription("Motivo")
		),

	new SlashCommandBuilder().setName('blackjack').setDescription('Jogar BlackJack.')
		.addNumberOption(option => option.setMaxValue(100000).setMinValue(1).setName('aposta')
			.setDescription('Valor da aposta')
			.setRequired(true)
		),

	new SlashCommandBuilder().setName('removecreditos').setDescription('Adiciona creditos a um usuario. Apenas ADM')
		.addUserOption(option => option.setName('usuario')
			.setDescription('remove créditos de um usuario')
			.setRequired(true)
		)
		.addNumberOption(option => option.setMaxValue(100000).setMinValue(1).setName('valor')
			.setDescription('quantidade de creditos')
			.setRequired(true)
		)
		.addStringOption(option => option.setName("motivo")
			.setDescription("Motivo")
		),
]
	.map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(AppConfig.TOKEN);
rest.put(Routes.applicationGuildCommands(AppConfig.CLIENT_ID, AppConfig.GUILD_ID), { body: commands, auth: true })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
