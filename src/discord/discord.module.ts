import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscordService } from './discord.service';
import { SecureDomainGuard } from '@/guards/auth.secure-domain';
import { ReadOnlyGuard } from '@/guards/auth.read-only';

@Module({
  imports: [ConfigModule],
  providers: [DiscordService, SecureDomainGuard, ReadOnlyGuard],
  exports: [DiscordService],
})
export class DiscordModule {}
