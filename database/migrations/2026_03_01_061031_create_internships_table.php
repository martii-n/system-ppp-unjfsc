<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('assignment_id')->constrained('assignments')->cascadeOnDelete();
            $table->foreignId('boss_id')->nullable()->constrained('bosses')->cascadeOnDelete();
            $table->string('internship_type');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->integer('grade')->nullable();
            $table->text('comment')->nullable();
            $table->unsignedTinyInteger('internship_step')->default(1);
            $table->unsignedTinyInteger('approval_status')->default(2);
            $table->unsignedTinyInteger('review_status')->default(0); // Controla el estado tanto para change type internship, and grade. 0 NONE, 1 APPROVED, 2 CHANGE_TYPE, 3 CHANGE_GRADE
            $table->unsignedTinyInteger('status')->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('internships');
    }
};
