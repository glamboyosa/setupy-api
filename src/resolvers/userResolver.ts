import { compare, genSalt, hash } from 'bcryptjs';
import { verify } from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from 'type-graphql';
import { User } from '../entities/user';
import { COOKIE_NAME, __prod__ } from '../utils/constants';
import { context } from '../utils/context';
import { UserResponse } from '../utils/response';
import {
  createAccessToken,
  forgotPasswordToken as forgotPasswordTokenHandler,
} from '../utils/tokens';
@InputType()
class UserInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}
@Resolver()
export class UserResolver {
  @Mutation(() => Boolean, { nullable: true })
  async Register(@Arg('UserInput') { username, email, password }: UserInput) {
    try {
      const emailExists = await User.findOne({ email });
      const usernameExists = await User.findOne({ username });
      if (emailExists) {
        return null;
      }
      if (usernameExists) {
        return null;
      }
      const salt = await genSalt(12);
      const hashedPassword = await hash(password, salt);
      await User.insert({
        email,
        password: hashedPassword,
        username,
      });
    } catch (e) {
      return {
        error: {
          message: e.message,
        },
      };
    }

    return true;
  }
  @Mutation(() => UserResponse)
  async Login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() { res }: context
  ) {
    let user: User;
    try {
      const existingUser = await User.findOne({ where: { email } });
      if (!existingUser) {
        return {
          error: {
            message: 'email or password incorrect',
          },
        };
      }
      const isValidPassword = await compare(password, existingUser.password);
      if (!isValidPassword) {
        return {
          error: {
            message: 'email or password incorrect',
          },
        };
      }
      user = existingUser;
    } catch (e) {
      return {
        error: {
          message: e.message,
        },
      };
    }
    res.cookie(COOKIE_NAME, createAccessToken(user), {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
      secure: __prod__,
      sameSite: 'lax',
    });
    return {
      user,
    };
  }
  @Mutation(() => Boolean)
  Logout(@Ctx() { res }: context) {
    res.clearCookie(COOKIE_NAME);
    return true;
  }
  @Query(() => UserResponse, { nullable: true })
  async Me(@Ctx() { req }: context) {
    const { jid } = req.cookies;
    if (!jid) {
      return null;
    }
    const token = verify(jid, process.env.ACCESS_TOKEN!) as any;
    if (!token) {
      return null;
    }
    const user = await User.findOne({ id: token.userId });
    if (!user) {
      return null;
    }
    return {
      user,
    };
  }
  @Mutation(() => Boolean, { nullable: true })
  async ForgotPassword(@Arg('email') email: string) {
    let user: User;
    try {
      const foundUser = await User.findOne({ email });
      if (!foundUser) {
        return null;
      }

      user = foundUser;
    } catch (e) {
      return null;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    const forgotPasswordToken = forgotPasswordTokenHandler(user);
    const mailOptions = {
      from: 'ogbemudiatimothy@gmail.com',
      to: user?.email,
      subject: 'Forgot Password',
      text: `forgot password reset link: http://localhost:3000/forgot-password/${forgotPasswordToken}`,
    };

    transporter.sendMail(mailOptions, function (error, _) {
      if (error) {
        return false;
      } else {
        return true;
      }
    });
    return true;
  }
  @Mutation(() => Boolean, { nullable: true })
  async ChangePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string
  ) {
    const forgotPasswordToken = verify(
      token,
      process.env.FORGOT_PASSWORD_TOKEN!
    ) as any;
    if (!forgotPasswordToken) {
      return null;
    }
    if (Date.now() >= forgotPasswordToken.exp * 1000) {
      return null;
    }
    try {
      const user = await User.findOne({ id: forgotPasswordToken.userId });
      if (!user) {
        return null;
      }
      const salt = await await genSalt(12);
      const hashedPassword = await hash(newPassword, salt);
      user.password = hashedPassword;
      await user.save();
    } catch (e) {
      return null;
    }
    return true;
  }
}
