// import { Controller, Get, UseGuards } from '@nestjs/common';
import { Controller, Get } from '@nestjs/common';
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
}
