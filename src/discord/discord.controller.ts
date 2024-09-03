// import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { DiscordService } from './discord.service';
// import { SecureDomainGuard } from '@/guards/auth.secure-domain';
// import { ReadOnlyGuard } from '@/guards/auth.read-only';

// @UseGuards(SecureDomainGuard, ReadOnlyGuard)
@Controller('discord')
export class DiscordController {
  constructor(private discordService: DiscordService) {}

  @Get('users-and-roles')
  async getUsersAndRoles() {
    return this.discordService.getUsersAndRoles();
  }

  @Get('user/:userId/roles')
  async getRolesByUserId(@Param('userId') userId: string) {
    const roles = await this.discordService.getRolesByUserId(userId);
    if (roles === null) {
      return { error: 'User not found or error occurred' };
    }
    return { userId, roles };
  }

  @Get('check-activity')
  async checkActivity(
    @Query('discordId') discordId: string,
    @Query('requiredRole') requiredRole: string,
  ) {
    try {
      if (!discordId || !requiredRole) {
        throw new HttpException(
          'Missing required query parameters',
          HttpStatus.BAD_REQUEST,
        );
      }

      const roles = await this.discordService.getRolesByUserId(discordId);

      if (roles === null) {
        return {
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found in the Discord server.',
          },
          data: {
            result: false,
          },
        };
      }

      const hasRequiredRole = roles.includes(requiredRole);

      return {
        data: {
          result: hasRequiredRole,
        },
      };
    } catch (error) {
      console.error('Error in checkActivity:', error);
      return {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred.',
        },
        data: {
          result: false,
        },
      };
    }
  }
}
