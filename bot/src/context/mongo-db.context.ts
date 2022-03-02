import { MikroORM } from "@mikro-orm/core";
import { EntityRepository, MongoDriver, MongoEntityRepository } from "@mikro-orm/mongodb";
import options from '../configs/mongo.config';

class MongoDbContext {
	orm: any;

	constructor() {
		this.connect();
	}

	async connect() {
		this.orm = await MikroORM.init(options);

		console.log("Conectado ao banco de dados")
	}

	async getRepository(entity: any): Promise<MongoEntityRepository<any>> {
		return await this.orm.em.fork().getRepository(entity);
	}
}

export const mongoDbContext: MongoDbContext = new MongoDbContext();