<?php

namespace App\Exceptions\Assignment;

use App\Exceptions\BusinessException;

class AssignmentNotAllowedException extends BusinessException
{
    protected $message = 'No tienes permiso para realizar esta acción.';

    public function status(): int
    {
        return 403;
    }

    public function code(): string
    {
        return 'ASSIGNMENT_NOT_ALLOWED';
    }
}
