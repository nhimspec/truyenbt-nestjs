import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from '@src/auth/auth.service';
import { RegisterDto } from '@src/api/auth/dto/register.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('api/auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Req() req) {
        const data = this.authService.login(req.user);
        return { data, message: 'Login successful' };
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    getProfile(@Req() req) {
        return { data: req.user, message: 'Get profile successful' };
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        const user = await this.authService.createUser(registerDto.email, registerDto.password);
        const data = this.authService.login(user);

        return { data, message: 'Register successful' };
    }
}
