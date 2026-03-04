<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;

class Handler extends ExceptionHandler
{
    public function register(): void
    {
        $this->renderable(function (BusinessException $e, $request) {
            return response()->json([
                'message' => $e->getMessage()
            ], $e->status());
        });
    }
}
