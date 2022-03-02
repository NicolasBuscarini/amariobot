import { Entity, Property } from "@mikro-orm/core";
import { BaseEntity } from "./base.model";

@Entity()
export class User extends BaseEntity {

  @Property()
  username: string;

  @Property({ nullable: false })
  credits: number;

  @Property({ nullable: false })
  daily: boolean = false;

  // @OneToMany(() => Book, b => b.author, { cascade: [Cascade.ALL] })
  // books = new Collection<Book>(this);

  // @ManyToOne(() => Book, { nullable: true })
  // favouriteBook?: Book;

  constructor(username: string, credits: number = 0) {
    super();
    this.username = username;
		this.credits = credits;
  }

}