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
        Schema::create('instituciones_educativas', function (Blueprint $table) {
            $table->id();
            $table->string('dane', 15);
            $table->string('consecutivo_dane', 16)->unique();
            $table->string('nombre');
            $table->string('tipo_sede');
            $table->string('zona');
            $table->string('direccion')->nullable();
            $table->string('telefono')->nullable();
            $table->string('estado');
            $table->text('niveles')->nullable();
            $table->text('modelos')->nullable();
            $table->string('grados')->nullable();
            $table->integer('comuna')->nullable();
            $table->bigInteger('latitud_raw');
            $table->bigInteger('longitud_raw');
            $table->decimal('latitud', 10, 8);
            $table->decimal('longitud', 11, 8);
 
            // Métricas
            $table->integer('numero_docentes_encuestados')->default(0);
            $table->decimal('indice_global_estudiantes', 4, 2)->default(0);
            $table->decimal('indice_global_stem', 4, 2)->default(0);
            $table->decimal('indice_global_docentes', 4, 2)->default(0);
            $table->decimal('indice_global_ciberseguridad', 4, 2)->default(0);
            $table->decimal('indice_global_icfes', 4, 2)->default(0);
 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('instituciones_educativas');
    }
};
