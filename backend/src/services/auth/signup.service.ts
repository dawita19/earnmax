import { Injectable } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { ReferralNetworkService } from '../../referral/network.service';
import { CreateUserDto } from '../dto/create-user.dto';
import * as argon2 from 'argon2';
import { generateInviteCode } from '../../../common/utils';
import { IPCheckerService } from '../../security/ip-checker.service';

@Injectable()
export class SignupService {
  constructor(
    private readonly usersService: UsersService,
    private readonly referralNetworkService: ReferralNetworkService,
    private readonly ipCheckerService: IPCheckerService,
  ) {}

  async register(createUserDto: CreateUserDto, ipAddress: string) {
    // Check if IP is allowed to register
    await this.ipCheckerService.checkIP(ipAddress);
    
    // Check if phone/email already exists
    await this.usersService.checkExistingUser(
      createUserDto.phone_number,
      createUserDto.email
    );

    // Process invitation code
    let inviterId = null;
    if (createUserDto.invite_code) {
      inviterId = await this.referralNetworkService.validateInviteCode(
        createUserDto.invite_code
      );
    }

    // Hash password
    const passwordHash = await argon2.hash(createUserDto.password);
    
    // Generate unique invite code
    const inviteCode = generateInviteCode();
    
    // Create user
    const user = await this.usersService.create({
      ...createUserDto,
      password_hash: passwordHash,
      invite_code: inviteCode,
      inviter_id: inviterId,
      ip_address: ipAddress,
      vip_level: 0,
      vip_amount: 0.00,
    });

    // Build referral network if inviter exists
    if (inviterId) {
      await this.referralNetworkService.buildNetwork(inviterId, user.user_id);
    }

    return user;
  }
}