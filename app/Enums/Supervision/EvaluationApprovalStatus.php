<?php

namespace App\Enums\Supervision;

enum EvaluationApprovalStatus: int
{
    case REJECTED = 0;
    case APPROVED = 1;
    case PENDING = 2;
    case OBSERVED_FILE = 3;
    case OBSERVED_GRADE = 4;
    case OBSERVED_GRADE_FILE = 5;
}
