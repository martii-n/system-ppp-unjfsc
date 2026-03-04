<?php

namespace App\Exceptions\Document;

use App\Exceptions\BusinessException;

class DocumentAlreadyApprovedException extends BusinessException
{
    protected $message = 'La evaluación ya fue aprobada o está pendiente.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'DOCUMENT_ALREADY_APPROVED';
    }
}
