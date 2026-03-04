<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'role_id',
        'semester_id',
        'section_id',
        'status',
        'access_status',
        'approval_status',
        'review_status'
    ];

    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo
     */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /**
     * @return BelongsTo
     */
    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    /**
     * @return BelongsTo
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * @return HasMany
     */
    public function teacherGroups(): HasMany
    {
        return $this->hasMany(InternshipGroup::class, 'teacher_assignment_id');
    }

    /**
     * @return HasMany
     */
    public function supervisorGroups(): HasMany
    {
        return $this->hasMany(InternshipGroup::class, 'supervisor_assignment_id');
    }

    /**
     * @return HasMany
     */
    public function studentGroups(): HasMany
    {
        return $this->hasMany(StudentGroup::class, 'student_assignment_id');
    }

    /**
     * @return HasMany
     */
    public function internships(): HasMany
    {
        return $this->hasMany(Internship::class, 'assignment_id');
    }
}
