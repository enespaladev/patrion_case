import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity'; // User entity'sini import edin
import { CreateUserDto } from './create-user.dto'; // CreateUserDto'yu import edin
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserRepository {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // User entity'si ile ilişkili repository
  ) {}

  // Kullanıcıyı ID'ye göre bulma
  async findById(id: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { id } });
    return user ?? undefined; // null ise undefined döner
  }

  async findOneByEmail(email: string): Promise<User | undefined> {
    const user = await this.userRepository.findOne({ where: { email } });
    return user ?? undefined;
  }

  // Kullanıcıyı kaydetme
  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  // Kullanıcıyı silme
  async deleteUser(id: number): Promise<void> {
    try {
      await this.userRepository.delete(id); // Kullanıcıyı ID'ye göre sil
    } catch (error) {
      throw new Error(`User with ID ${id} not found: ${error.message}`);
    }
  }

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }
    const token = this.jwtService.sign({ sub: user.id, role: user.role });
    return { access_token: token };
  }

  // Diğer gerekli metotları buraya ekleyebilirsiniz
}
