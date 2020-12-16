import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Posts } from './posts';
@ObjectType()
@Entity('users')
export class User extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  email: string;

  @Column({ length: 100 })
  password: string;

  @Field()
  @Column({ length: 100 })
  username: string;

  @Field(() => [Posts])
  @OneToMany(() => Posts, (post) => post.user, { onDelete: 'CASCADE' })
  posts: Posts[];
}
