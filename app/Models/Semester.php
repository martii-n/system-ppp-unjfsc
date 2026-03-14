<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\Academic\SemesterStatus;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'cycle',
        'status'
    ];

    protected $casts = [
        'status' => SemesterStatus::class
    ];

    /**
     * @return HasMany
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class);
    }

    /**
     * @return HasMany
     */
    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    /**
     * @return Semester|null
     */
    public static function getActiveSemester(): ?Semester
    {
        return self::query()->where('status', 1)->first();
    }

}
