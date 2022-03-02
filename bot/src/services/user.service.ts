import { User } from "../models/user.model";
import { mongoDbContext as ctx } from "../context/mongo-db.context";
import { EntityRepository } from "@mikro-orm/core";
import { MongoEntityRepository } from "@mikro-orm/mongodb";

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

	async mudarCreditos(user: User, qtd: number) {
		const userRepository = await this.userRepository();
		user.credits += qtd;
		await userRepository.persistAndFlush(user);
	}

}

export const userService = new UserService();