<?php

namespace App\Exceptions\Semester;

use App\Exceptions\BusinessException;

class SemesterRollbackNotAllowedException extends BusinessException
{
    protected $message = 'Solo se puede retroceder desde un semestre activo';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'SEMESTER_ROLLBACK_NOT_ALLOWED';
    }
}
