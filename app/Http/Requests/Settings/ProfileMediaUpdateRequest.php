<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class ProfileMediaUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'photo' => ['nullable', function ($attribute, $value, $fail) {
                if ($value !== 'deleted' && !($value instanceof \Illuminate\Http\UploadedFile)) {
                    $fail('La foto debe ser una imagen válida o la instrucción de eliminación.');
                }
            }],
            'banner' => ['nullable', function ($attribute, $value, $fail) {
                if ($value !== 'deleted' && !($value instanceof \Illuminate\Http\UploadedFile)) {
                    $fail('El fondo debe ser una imagen válida o la instrucción de eliminación.');
                }
            }],
        ];
    }
}
