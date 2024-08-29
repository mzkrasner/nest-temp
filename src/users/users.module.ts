import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { SecureDomainGuard } from '@/guards/auth.secure-domain';
import { ReadOnlyGuard } from '@/guards/auth.read-only';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService, SecureDomainGuard, ReadOnlyGuard],
  exports: [UsersService],
})
export class UsersModule {}
