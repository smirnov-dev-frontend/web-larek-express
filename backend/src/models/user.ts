import {
  Schema, Model, HydratedDocument, model,
} from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import UnauthorizedError from '../errors/unauthorized-error';

interface IToken {
  token: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

interface IUserModel extends Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string,
  ) => Promise<HydratedDocument<IUser>>;
}

const tokenSchema = new Schema<IToken>(
  {
    token: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: {
      type: String,
      default: 'Ё-мое',
      minlength: [2, 'Минимальная длина поля "name" - 2'],
      maxlength: [30, 'Максимальная длина поля "name" - 30'],
    },
    email: {
      type: String,
      unique: true,
      required: [true, 'Поле "email" должно быть заполнено'],
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: 'Поле "email" должно быть валидным email-адресом',
      },
    },
    password: {
      type: String,
      required: [true, 'Поле "password" должно быть заполнено'],
      minlength: [6, 'Минимальная длина поля "password" - 6'],
      select: false,
    },
    tokens: {
      type: [tokenSchema],
      select: false,
    },
  },
  { versionKey: false },
);

userSchema.pre('save', async function hashPassword() {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.static(
  'findUserByCredentials',
  async function findUserByCredentials(email: string, password: string) {
    const user = await this.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }
    return user;
  },
);

export default model<IUser, IUserModel>('user', userSchema);
