import { User } from '../entities/user';
import { ObjectType, Field } from 'type-graphql';
import { Posts } from '../entities/posts';
@ObjectType()
class Error {
  @Field()
  message: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => Error, { nullable: true })
  error?: Error;
  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class PostsResponse {
  @Field(() => Error, { nullable: true })
  error?: Error;
  @Field(() => [Posts], { nullable: true })
  posts: Posts[];
  @Field(() => Posts, { nullable: true })
  post: Posts;
}
