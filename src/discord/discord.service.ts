import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, GatewayIntentBits, Guild } from 'discord.js';

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;
  private guild: Guild;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });
  }

  async onModuleInit() {
    await this.client.login(this.configService.get<string>('DISCORD_TOKEN'));
    this.guild = await this.client.guilds.fetch(
      this.configService.get<string>('DISCORD_GUILD_ID'),
    );
  }

  async getUsersAndRoles(): Promise<Array<{ user: string; roles: string[] }>> {
    await this.guild.members.fetch();

    return this.guild.members.cache.map((member) => ({
      user: `${member.user.username}#${member.user.discriminator}`,
      roles: member.roles.cache
        .filter((role) => role.name !== '@everyone')
        .map((role) => role.name),
    }));
  }
}
