<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitucionEducativa extends Model
{
    protected $table = 'instituciones_educativas';

    protected $fillable = [
        'dane',
        'consecutivo_dane',
        'nombre',
        'tipo_sede',
        'zona',
        'direccion',
        'telefono',
        'estado',
        'niveles',
        'modelos',
        'grados',
        'comuna',
        'latitud_raw',
        'longitud_raw',
        'latitud',
        'longitud',
        'numero_docentes_encuestados',
        'indice_global_estudiantes',
        'indice_global_stem',
        'indice_global_docentes',
        'indice_global_ciberseguridad',
        'indice_global_icfes',
    ];

    protected $casts = [
        'latitud'                      => 'float',
        'longitud'                     => 'float',
        'indice_global_estudiantes'    => 'float',
        'indice_global_stem'           => 'float',
        'indice_global_docentes'       => 'float',
        'indice_global_ciberseguridad' => 'float',
        'indice_global_icfes'          => 'float',
        'comuna'                       => 'integer',
    ];

    // ─── Getters ───────────────────────────────────────────────────────────────

    public function getDane(): string
    {
        return $this->attributes['dane'];
    }

    public function getNombre(): string
    {
        return ucwords(strtolower($this->attributes['nombre']));
    }

    public function getLatitud(): float
    {
        return (float) $this->attributes['latitud'];
    }

    public function getLongitud(): float
    {
        return (float) $this->attributes['longitud'];
    }

    public function getNumeroDocentesEncuestados(): int
    {
        return (int) $this->attributes['numero_docentes_encuestados'];
    }

    public function getIndiceGlobalEstudiantes(): float
    {
        return (float) $this->attributes['indice_global_estudiantes'];
    }

    public function getIndiceGlobalStem(): float
    {
        return (float) $this->attributes['indice_global_stem'];
    }

    public function getIndiceGlobalDocentes(): float
    {
        return (float) $this->attributes['indice_global_docentes'];
    }

    public function getIndiceGlobalCiberseguridad(): float
    {
        return (float) $this->attributes['indice_global_ciberseguridad'];
    }

    public function getIndiceGlobalIcfes(): float
    {
        return (float) $this->attributes['indice_global_icfes'];
    }

    // ─── Setters ───────────────────────────────────────────────────────────────

    public function setDane(string $value): void
    {
        $this->attributes['dane'] = trim($value);
    }

    public function setNombre(string $value): void
    {
        $this->attributes['nombre'] = strtoupper(trim($value));
    }

    public function setLatitud(float $value): void
    {
        $this->attributes['latitud'] = $value;
    }

    public function setLongitud(float $value): void
    {
        $this->attributes['longitud'] = $value;
    }

    public function setNumeroDocentesEncuestados(int $value): void
    {
        $this->attributes['numero_docentes_encuestados'] = $value;
    }

    public function setIndiceGlobalEstudiantes(float $value): void
    {
        $this->attributes['indice_global_estudiantes'] = $value;
    }

    public function setIndiceGlobalStem(float $value): void
    {
        $this->attributes['indice_global_stem'] = $value;
    }

    public function setIndiceGlobalDocentes(float $value): void
    {
        $this->attributes['indice_global_docentes'] = $value;
    }

    public function setIndiceGlobalCiberseguridad(float $value): void
    {
        $this->attributes['indice_global_ciberseguridad'] = $value;
    }

    public function setIndiceGlobalIcfes(float $value): void
    {
        $this->attributes['indice_global_icfes'] = $value;
    }
}