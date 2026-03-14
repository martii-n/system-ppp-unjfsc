<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class StepThreeRequest extends FormRequest
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
        /*
        "email": "usuario@example.com",
        "role_id": 2,
        "section_id": 5,
        "user_id": null,
        "person": {
          "id": null,
          "dni": "12345678",
          "names": "Juan Angel",
          "surnames": "Perez Gonzales"
        } */
        return [
            'email' => 'required|email|unique:users,email,'.$this->user_id,
            'role_id' => 'required|exists:roles,id',
            'section_id' => 'required|exists:sections,id',
            'user_id' => 'nullable|exists:users,id',
            'type_user_id' => 'nullable|exists:type_users,id',
            'person.id' => 'nullable|exists:people,id',
            'person.dni' => [
                    'required_if:user_id,null',
                    'string',
                    'digits:8',
                    'unique:people,dni,'. ($this->input('person.id') ?? 'NULL').',id',
                ],
            'person.names' => 'required_if:user_id,null|string|max:100',
            'person.surnames' => 'required_if:user_id,null|string|max:100'
        ];
    }
}
