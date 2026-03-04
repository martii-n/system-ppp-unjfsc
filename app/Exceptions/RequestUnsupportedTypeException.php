<?php

namespace App\Exceptions;

use App\Exceptions\BusinessException;

class RequestUnsupportedTypeException extends BusinessException
{
    protected $message = 'El tipo de solicitud no es soportado para ejecución automática.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'UNSUPPORTED_REQUEST_TYPE';
    }
}
