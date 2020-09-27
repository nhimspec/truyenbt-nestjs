import {
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { User } from '@src/schemas/user.schema';
import UserRepository from '@src/repositories/user.repository';

@ValidatorConstraint({ async: true })
export class IsExistsUserConstraint implements ValidatorConstraintInterface {
    constructor(protected readonly userRepository: UserRepository) {}
    async validate(email: any, args: ValidationArguments): Promise<boolean> {
        const user: User | null = await this.userRepository.findOne({
            email,
        });

        return !user;
    }

    defaultMessage(args: ValidationArguments) {
        return 'User $value already exists';
    }
}

export function IsExistsUser(validationOptions?: ValidationOptions) {
    return function(object: any, propertyName: string) {
        registerDecorator({
            name: 'isExists',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [],
            options: validationOptions,
            validator: IsExistsUserConstraint,
        });
    };
}
