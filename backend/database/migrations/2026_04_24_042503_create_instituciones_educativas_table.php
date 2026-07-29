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
 
            // ─── Identificación ────────────────────────────────────────────
            $table->string('cod_dane', 16)->unique();
            $table->string('nombre_institucion');
            $table->string('sede_principal')->nullable();
 
            // ─── Contacto ──────────────────────────────────────────────────
            $table->string('correo_institucional')->nullable();
            $table->string('telefono', 60)->nullable();
            $table->string('direccion')->nullable();
 
            // ─── Ubicación ─────────────────────────────────────────────────
            $table->decimal('latitud',  17, 14);
            $table->decimal('longitud', 17, 14);
 
            // ─── Clasificación ─────────────────────────────────────────────
            $table->string('calendario', 30)->nullable();
            $table->string('naturaleza', 60)->nullable();
            $table->string('sector', 60)->nullable();
            $table->string('zona', 30)->nullable();
            $table->string('jornada')->nullable();
            $table->text('nivel')->nullable();
 
            // ─── Métricas: STEM ────────────────────────────────────────────
            $table->decimal('indice_global_stem', 5, 2)->nullable();
            $table->unsignedInteger('docentes_encuestados_stem')->nullable();
 
            // ─── Métricas: competencias docentes ───────────────────────────
            $table->decimal('indice_global_docentes', 5, 2)->nullable();
            $table->unsignedInteger('docentes_encuestados_cd')->nullable();
 
            // ─── Métricas: ICFES ───────────────────────────────────────────
            $table->decimal('indice_global_icfes', 5, 2)->nullable();
            $table->unsignedInteger('encuestados_icfes')->nullable();
 
            // ─── Métricas: estudiantes ─────────────────────────────────────
            $table->decimal('indice_global_estudiantes', 5, 2)->nullable();
            $table->unsignedInteger('encuestados_estudiantes')->nullable();
 
            // ─── Métricas: ciberseguridad ──────────────────────────────────
            $table->decimal('indice_global_ciberseguridad', 5, 2)->nullable();
            $table->unsignedInteger('encuestados_ciberseguridad')->nullable();
 
            $table->timestamps();
 
            // ─── Índices para filtros del mapa ─────────────────────────────
            $table->index('zona');
            $table->index('sector');
            $table->index('naturaleza');
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
