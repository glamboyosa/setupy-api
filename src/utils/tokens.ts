import { sign } from 'jsonwebtoken';
import { User } from 'src/entities/user';
export const createAccessToken = (user: User) => {
  return sign({ userId: user.id }, process.env.ACCESS_TOKEN!);
};
export const forgotPasswordToken = (user: User) => {
  return sign({ userId: user.id }, process.env.FORGOT_PASSWORD_TOKEN!, {
    expiresIn: '30mins',
  });
};
