<?php

namespace App\Exceptions\Document;

use App\Exceptions\BusinessException;

class DocumentInvalidContextException extends BusinessException
{
    protected $message = 'El contexto del documento no es válido.';

    public function status(): int
    {
        return 409;
    }

    public function code(): string
    {
        return 'CONTEXT_INVALID';
    }
}
