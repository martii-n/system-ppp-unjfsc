<?php

namespace App\Exceptions;

use Exception;

abstract class BusinessException extends Exception
{
    abstract public function status(): int;

    public function code(): string
    {
        return class_basename(static::class);
    }
}
