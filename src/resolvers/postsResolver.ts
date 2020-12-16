import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Posts } from '../entities/posts';
import { User } from '../entities/user';
import { PostsResponse } from '../utils/response';
import { getConnection, getRepository } from 'typeorm';
@Resolver()
export class PostsResolver {
  postRepository = getRepository(Posts);
  @Query(() => PostsResponse)
  async GetPostById(@Arg('id') id: number) {
    const post = await this.postRepository.findOne({ where: { id } });
    if (!post) {
      return {
        error: {
          message: 'Cannot find post',
        },
      };
    }
    return {
      post,
    };
  }
  @Query(() => PostsResponse)
  async GetPosts() {
    const posts = await this.postRepository.find();
    if (!posts || posts.length < 1) {
      return {
        error: {
          message: 'Register and be the first one to add some posts',
        },
      };
    }
    return {
      posts,
    };
  }
  @Query(() => PostsResponse)
  async GetPostsByUser(@Arg('username') username: string) {
    let posts: Posts[];
    try {
      const userPosts = await this.postRepository.find({ where: { username } });

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return {
          error: {
            message: 'Sorry this user does not exist :/',
          },
        };
      }
      if (userPosts.length < 1) {
        return {
          error: {
            message: 'Sorry the user has no posts :/',
          },
        };
      }
      posts = userPosts;
    } catch (e) {
      return {
        error: {
          message: e.message,
        },
      };
    }
    return {
      posts,
    };
  }
  @Mutation(() => PostsResponse)
  async CreatePosts(
    @Arg('picture') picture: string,
    @Arg('description') description: string,
    @Arg('username') username: string
  ) {
    let user: User;
    let newPost: Posts;
    // send in user's ID to test bc it isn't setting a cookie on the server
    // eventually replace with a `Me` Query or alternatively run me query when the modal is rendered and pass in userId
    try {
      const existingUser = await User.findOne({ where: { username } });
      if (!existingUser) {
        return {
          error: {
            message: 'you need to have an account to post',
          },
        };
      }
      if (description.length < 10) {
        return {
          error: {
            message: 'your description needs to be a bit longer buddy',
          },
        };
      }

      user = existingUser;

      const post = await this.postRepository.create({
        description,
        photoPath: picture,
        username,
      });
      const savedPost = await this.postRepository.save(post);

      newPost = savedPost;
    } catch (e) {
      return {
        error: {
          message: e.message,
        },
      };
    }

    return {
      post: newPost,
    };
  }

  @Mutation(() => Boolean, { nullable: true })
  async DeletePost(@Arg('id') id: number) {
    try {
      await this.postRepository.delete(id);
      return true;
    } catch (e) {
      return false;
    }
  }
}
