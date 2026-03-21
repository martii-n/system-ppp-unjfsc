<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class StepOneMassiveRequest extends FormRequest
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
            'role_id' => 'required|exists:roles,id',
            'section_id' => 'required|exists:sections,id',
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ];
    }

    public function messages(): array
    {
        return [
            'role_id.required' => 'El rol es obligatorio.',
            'role_id.exists' => 'El rol no existe.',
            'section_id.required' => 'La sección es obligatoria.',
            'section_id.exists' => 'La sección no existe.',
            'file.required' => 'El archivo es obligatorio.',
            'file.file' => 'El archivo debe ser un archivo.',
            'file.mimes' => 'El archivo debe ser un archivo Excel.',
            'file.max' => 'El archivo debe ser menor a 10MB.',
        ];
    }
}