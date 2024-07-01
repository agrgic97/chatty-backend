import { emailSchema, passwordSchema } from '@auth/schemes/password';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { config } from '@root/config';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import moment from 'moment';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);
    if(!existingUser) {
      throw new BadRequestError('User does not exist');
    }
    const randomBytes: Buffer = crypto.randomBytes(20);
    const randomChars: string = randomBytes.toString('hex');
    await authService.updatePasswordToken(`${existingUser._id}`, randomChars, Date.now() + 60 * 60 * 1000);

    const resetLink: string = `${config.CLIENT_URL}/reset-password?token=${randomChars}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(existingUser.username, resetLink);
    emailQueue.addEmailJob('forgotPasswordEmail', { template, receiverEmail: existingUser.email, subject: 'Reset your password' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password reset link sent to email' });
  }

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const token: string = req.params.token;
    if(password !== confirmPassword) {
      throw new BadRequestError('Passwords do not match');
    }
    const existingUser: IAuthDocument = await authService.getAuthUserByPasswordToken(token);
    if(!existingUser) {
      throw new BadRequestError('Token has expired');
    }

    existingUser.password = password;
    existingUser.passwordResetToken = undefined;
    existingUser.passwordResetExpires = undefined;
    await existingUser.save();

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: req.ip!,
      date: moment().format('MMMM Do YYYY, h:mm:ss a')
    }

    const template: string = resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    emailQueue.addEmailJob('resetPasswordEmail', { template, receiverEmail: existingUser.email, subject: 'Password Reset Confirmation' });
    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}
