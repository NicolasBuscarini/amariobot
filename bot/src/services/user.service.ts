import { User } from "../models/user.model";
import { mongoDbContext as ctx } from "../context/mongo-db.context";
import { EntityRepository } from "@mikro-orm/core";
import { MongoEntityRepository } from "@mikro-orm/mongodb";
import { TextBasedChannel } from "discord.js";

class UserService {

	_userRepository?: MongoEntityRepository<User>;
	
	async userRepository(): Promise<MongoEntityRepository<User>> {
		if (this._userRepository === undefined) {
			this._userRepository = await ctx.getRepository(User);
		}

		return this._userRepository;
	}

	async signUp(user: User): Promise<User> {
		const userRepository = await this.userRepository();
		userRepository.persistAndFlush(user); // Criar instância
		return user
	}

	async getUserByUserId(userid: string): Promise<User | null> {
		const userRepository = await this.userRepository();
		try {
			return await userRepository.findOneOrFail({ userid: userid});
		} catch (e) {return null}
	}

	async getOrCreateUserByUserId(userid: string): Promise<User> {
		let user =  await this.getUserByUserId(userid);
		if (user) return user;
		await this.signUp(new User(userid));
		user = await this.getUserByUserId(userid);
		return user!
	}

	async adicionaCreditos(user: User, creditos: number) {
		const userRepository = await this.userRepository();
		user.credits += creditos;
		if(user.credits < 0 )
			user.credits = 0;

		await userRepository.persistAndFlush(user);
	}

	async gastarCreditos(user: User, creditos: number) : Promise<boolean>{
		if (user.credits < creditos) {
			return false;
		}
		await this.adicionaCreditos(user, -creditos);
		return true;
		
	}

	async getLevelByExp(exp: number) {
		return Math.floor((Math.sqrt(625+100*exp)-25)/50)
	  }

	async getExpByLevel(level: number) {
		let exp = 0;
		while (await this.getLevelByExp(exp) < level) {
		  exp += 50;
		}
		return exp;
	}

	async getExpToNextLevel(currentLevel: number) {
		return await this.getExpByLevel(currentLevel+1) - await this.getExpByLevel(currentLevel);
	}

	async ganharExp(user: User, exp: number, channel: TextBasedChannel){
		const userRepository = await this.userRepository();

		const oldLevel = await this.getLevelByExp(user.exp);
		user.exp += exp;
		const newLevel = await this.getLevelByExp(user.exp);

		await userRepository.persistAndFlush(user);

		if (oldLevel != newLevel ) {
			channel.send(`Parabéns, <@!${user.userid}>!  Você subiu para o *level ${newLevel}*`)
		}
	}

	async updateUser(user: User, partialUser: Partial<User>) {
		const userRepository = await this.userRepository();
		for (let key of Object.keys(partialUser)) {
			if ((partialUser as any)[key]!== undefined) {
				(user as any)[key] = (partialUser as any)[key];
			}
		}
		await userRepository.persistAndFlush(user);
	}
}

export const userService = new UserService();