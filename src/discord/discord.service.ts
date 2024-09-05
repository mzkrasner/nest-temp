import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Client,
  GatewayIntentBits,
  Guild,
  Message,
  TextChannel,
} from 'discord.js';

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

  async getRolesByUserId(userId: string): Promise<string[] | null> {
    try {
      const member = await this.guild.members.fetch(userId);

      if (!member) {
        return null; // User not found in the guild
      }

      return member.roles.cache
        .filter((role) => role.name !== '@everyone')
        .map((role) => role.name);
    } catch (error) {
      console.error(`Error fetching roles for user ${userId}:`, error);
      return null; // Return null if there's an error (e.g., user not in guild)
    }
  }

  async sendMessage(channelId: string, message: string): Promise<void> {
    const channel = (await this.client.channels.fetch(
      channelId,
    )) as TextChannel;
    await channel.send(message);
  }

  async getLatestMessage(channelId: string): Promise<Message | undefined> {
    const channel = (await this.client.channels.fetch(
      channelId,
    )) as TextChannel;
    const messages = await channel.messages.fetch({ limit: 1 });
    return messages.first();
  }
}
