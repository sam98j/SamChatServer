import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './users.schema';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoginDTO, RegisterDTO } from 'src/auth/auth.interface';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => ({ uri: configService.get('MONGODB_URI') }),
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UsersService],
      exports: [MongooseModule, UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('test usr services', () => {
    it('add new usr', async () => {
      // const result = '';
      jest.spyOn(service, 'addUser').mockImplementation();
      // new usr
      const newUsr = {
        email: 'hosame@gmail.com',
        name: 'H',
        password: 'H',
        usrname: 't_u_',
        avatar: '',
      } as RegisterDTO;
      expect(await service.addUser(newUsr)).toHaveProperty('name');
    });
    it('get usr by email and password', async () => {
      // const result = '';
      jest.spyOn(service, 'getUserByCred').mockImplementation();
      // new usr
      const usrCred = {
        email: 'nofaf@mailinator.com',
        password: 'Pa$$w0rd!',
      } as LoginDTO;
      expect(await service.getUserByCred(usrCred)).toBeTruthy();
    });
  });
});
