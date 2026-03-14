<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class RegistrationRoleNotAllowedException extends BusinessException
{
    protected $message = 'Estás intentando registrar un usuario con un rol no permitido.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_REGISTRATION_ROLE_NOT_ALLOWED';
    }
}
