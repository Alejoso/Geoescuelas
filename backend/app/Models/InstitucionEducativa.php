<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitucionEducativa extends Model
{
    protected $connection = 'supabase';
    protected $table = 'institution_indicators';

    protected $primaryKey = 'cod_dane';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $casts = [
        'latitud'                      => 'decimal:14',
        'longitud'                     => 'decimal:14',
        'indice_global_stem'           => 'float',
        'docentes_encuestados_stem'    => 'integer',
        'indice_global_docentes'       => 'float',
        'docentes_encuestados_cd'      => 'integer',
        'indice_global_icfes'          => 'float',
        'encuestados_icfes'            => 'integer',
        'indice_global_estudiantes'    => 'float',
        'encuestados_estudiantes'      => 'integer',
        'indice_global_ciberseguridad' => 'float',
        'encuestados_ciberseguridad'   => 'integer',
    ];

    // ─── Getters: identificación ───────────────────────────────────────────────

    public function getCodDane(): string
    {
        return (string) $this->getAttribute('cod_dane');
    }

    public function getNombreInstitucion(): string
    {
        return ucwords(strtolower((string) $this->getAttribute('nombre_institucion')));
    }

    public function getSedePrincipal(): ?string
    {
        return $this->getAttribute('sede_principal');
    }

    // ─── Getters: contacto y ubicación ─────────────────────────────────────────

    public function getCorreoInstitucional(): ?string
    {
        return $this->getAttribute('correo_institucional');
    }

    public function getTelefono(): ?string
    {
        return $this->getAttribute('telefono');
    }

    public function getDireccion(): ?string
    {
        return $this->getAttribute('direccion');
    }

    public function getLatitud(): float
    {
        return (float) $this->getAttribute('latitud');
    }

    public function getLongitud(): float
    {
        return (float) $this->getAttribute('longitud');
    }

    /**
     * Valor exacto tal como está en la base de datos, sin pasar por float.
     * Útil para exportar o comparar sin perder el último dígito.
     */
    public function getLatitudExacta(): string
    {
        return (string) $this->getAttribute('latitud');
    }

    public function getLongitudExacta(): string
    {
        return (string) $this->getAttribute('longitud');
    }

    // ─── Getters: clasificación ────────────────────────────────────────────────

    public function getCalendario(): ?string
    {
        return $this->getAttribute('calendario');
    }

    public function getNaturaleza(): ?string
    {
        return $this->getAttribute('naturaleza');
    }

    public function getSector(): ?string
    {
        return $this->getAttribute('sector');
    }

    public function getZona(): ?string
    {
        return $this->getAttribute('zona');
    }

    public function getJornada(): ?string
    {
        return $this->getAttribute('jornada');
    }

    public function getNivel(): ?string
    {
        return $this->getAttribute('nivel');
    }

    // ─── Getters: índices y encuestados ────────────────────────────────────────

    public function getIndiceGlobalStem(): ?float
    {
        $value = $this->getAttribute('indice_global_stem');

        return $value === null ? null : (float) $value;
    }

    public function getDocentesEncuestadosStem(): ?int
    {
        $value = $this->getAttribute('docentes_encuestados_stem');

        return $value === null ? null : (int) $value;
    }

    public function getIndiceGlobalDocentes(): ?float
    {
        $value = $this->getAttribute('indice_global_docentes');

        return $value === null ? null : (float) $value;
    }

    public function getDocentesEncuestadosCd(): ?int
    {
        $value = $this->getAttribute('docentes_encuestados_cd');

        return $value === null ? null : (int) $value;
    }

    public function getIndiceGlobalIcfes(): ?float
    {
        $value = $this->getAttribute('indice_global_icfes');

        return $value === null ? null : (float) $value;
    }

    public function getEncuestadosIcfes(): ?int
    {
        $value = $this->getAttribute('encuestados_icfes');

        return $value === null ? null : (int) $value;
    }

    public function getIndiceGlobalEstudiantes(): ?float
    {
        $value = $this->getAttribute('indice_global_estudiantes');

        return $value === null ? null : (float) $value;
    }

    public function getEncuestadosEstudiantes(): ?int
    {
        $value = $this->getAttribute('encuestados_estudiantes');

        return $value === null ? null : (int) $value;
    }

    public function getIndiceGlobalCiberseguridad(): ?float
    {
        $value = $this->getAttribute('indice_global_ciberseguridad');

        return $value === null ? null : (float) $value;
    }

    public function getEncuestadosCiberseguridad(): ?int
    {
        $value = $this->getAttribute('encuestados_ciberseguridad');

        return $value === null ? null : (int) $value;
    }
}