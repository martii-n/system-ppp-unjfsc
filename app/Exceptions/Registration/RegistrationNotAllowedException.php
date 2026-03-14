<?php

namespace App\Exceptions\Registration;

use App\Exceptions\BusinessException;

class RegistrationNotAllowedException extends BusinessException
{
    protected $message = 'No tienes permiso para realizar registros de usuarios.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'USER_REGISTRATION_NOT_ALLOWED';
    }
}
