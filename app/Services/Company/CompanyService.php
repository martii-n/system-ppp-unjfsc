<?php

namespace App\Services\Company;

use App\Models\Area;
use App\Models\Company;
use App\Models\Staff;
use Illuminate\Support\Collection;

class CompanyService
{

    public function verifyCompany(string $ruc): array
    {
        $company = Company::query()->where('ruc', $ruc)->first();
        $payload = [
            'id' => $company->id,
            'name' => $company->name,
            'address' => $company->address,
            'phone' => $company->phone,
            'email' => $company->email,
        ];
        $areas = $this->listAreas($company->id);
        $payload['areas'] = $areas;
        return $payload;
    }

    public function registerCompany(array $data): Company
    {
        $company = Company::query()->create([
            'name'    => $data['name'],
            'ruc'     => $data['ruc'],
            'razon'   => $data['razon'] ?? $data['name'],  // fallback: si no mandan razón social, usa el nombre
            'address' => $data['address'] ?? '',
            'phone'   => $data['phone'] ?? '',
            'email'   => $data['email'] ?? '',
        ]);

        return $company;
    }

    public function listAreas(int $companyId): Collection
    {
        $areas = Area::query()->where('company_id', $companyId)->get();

        return $areas;
    }

    public function registerStaff(array $data): Staff
    {
        $staff = Staff::query()->create([
            'name' => $data['name'],
            'position' => $data['position'],
            'email' => $data['email'],
            'phone' => $data['phone'],
        ]);

        return $staff;
    }

    public function registerArea(array $data): Area
    {
        $area = Area::query()->create([
            'name' => $data['name'],
            'description' => $data['description'],
            'company_id' => $data['company_id'],
        ]);

        return $area;
    }
}