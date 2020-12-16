import { Arg, Mutation, Query, Resolver } from 'type-graphql';
import { Posts } from '../entities/posts';
import { User } from '../entities/user';
import { PostsResponse } from '../utils/response';
import { getConnection, getRepository } from 'typeorm';
@Resolver()
export class PostsResolver {
  postRepository = getRepository(Posts);
  userRepository = getRepository(User);
  @Query(() => PostsResponse)
  async GetPostById(@Arg('id') id: number) {
    const post = await this.postRepository.findOne(
      { id },
      { relations: ['votes', 'user'] }
    );
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
    const posts = await this.postRepository.find({
      relations: ['votes', 'user'],
    });
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
      const userPosts = await this.userRepository.findOne(
        { username },
        { relations: ['posts'] }
      );

      if (userPosts!.posts!.length < 1 || !userPosts) {
        return {
          error: {
            message: 'Sorry the user has no posts :/',
          },
        };
      }
      posts = userPosts.posts;
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
      const existingUser = await this.userRepository.findOne(
        { username },
        { relations: ['posts'] }
      );
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
        user,
        votes: [],
      });
      const savedPost = await this.postRepository.save(post);
      existingUser.posts = [...existingUser.posts, savedPost];
      await this.userRepository.save(existingUser);
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
      const post = await this.postRepository.findOne({ id });
      await post?.remove();
      return true;
    } catch (e) {
      return false;
    }
  }
}
