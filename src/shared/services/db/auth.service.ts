import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@global/helpers/helpers';
import { AuthModel } from '@auth/interfaces/auth.schema';

class AuthService {
  public async createUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };
    return (await AuthModel.findOne(query).exec()) as IAuthDocument;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    return (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IAuthDocument;
  }
}

export const authService: AuthService = new AuthService();
