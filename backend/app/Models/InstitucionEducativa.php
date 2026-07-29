<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstitucionEducativa extends Model
{
    protected $table = 'instituciones_educativas';

    protected $fillable = [
        'cod_dane',
        'nombre_institucion',
        'sede_principal',
        'correo_institucional',
        'telefono',
        'direccion',
        'calendario',
        'naturaleza',
        'sector',
        'zona',
        'jornada',
        'nivel',
        'latitud',
        'longitud',
        'indice_global_stem',
        'docentes_encuestados_stem',
        'indice_global_docentes',
        'docentes_encuestados_cd',
        'indice_global_icfes',
        'encuestados_icfes',
        'indice_global_estudiantes',
        'encuestados_estudiantes',
        'indice_global_ciberseguridad',
        'encuestados_ciberseguridad',
    ];

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

    // ─── Setters: identificación ───────────────────────────────────────────────

    public function setCodDane(string $value): void
    {
        $this->setAttribute('cod_dane', trim($value));
    }

    public function setNombreInstitucion(string $value): void
    {
        $this->setAttribute('nombre_institucion', strtoupper(trim($value)));
    }

    public function setSedePrincipal(?string $value): void
    {
        $this->setAttribute('sede_principal', $value === null ? null : trim($value));
    }

    // ─── Setters: contacto y ubicación ─────────────────────────────────────────

    public function setCorreoInstitucional(?string $value): void
    {
        $this->setAttribute('correo_institucional', $value === null ? null : strtolower(trim($value)));
    }

    public function setTelefono(?string $value): void
    {
        $this->setAttribute('telefono', $value === null ? null : trim($value));
    }

    public function setDireccion(?string $value): void
    {
        $this->setAttribute('direccion', $value === null ? null : trim($value));
    }

    /**
     * Acepta string para no perder precisión cuando el origen trae 14 decimales.
     */
    public function setLatitud(float|string $value): void
    {
        $this->setAttribute('latitud', trim((string) $value));
    }

    public function setLongitud(float|string $value): void
    {
        $this->setAttribute('longitud', trim((string) $value));
    }

    // ─── Setters: clasificación ────────────────────────────────────────────────

    public function setCalendario(?string $value): void
    {
        $this->setAttribute('calendario', $value === null ? null : trim($value));
    }

    public function setNaturaleza(?string $value): void
    {
        $this->setAttribute('naturaleza', $value === null ? null : trim($value));
    }

    public function setSector(?string $value): void
    {
        $this->setAttribute('sector', $value === null ? null : trim($value));
    }

    public function setZona(?string $value): void
    {
        $this->setAttribute('zona', $value === null ? null : trim($value));
    }

    public function setJornada(?string $value): void
    {
        $this->setAttribute('jornada', $value === null ? null : trim($value));
    }

    public function setNivel(?string $value): void
    {
        $this->setAttribute('nivel', $value === null ? null : trim($value));
    }

    // ─── Setters: índices y encuestados ────────────────────────────────────────

    public function setIndiceGlobalStem(?float $value): void
    {
        $this->setAttribute('indice_global_stem', $value);
    }

    public function setDocentesEncuestadosStem(?int $value): void
    {
        $this->setAttribute('docentes_encuestados_stem', $value);
    }

    public function setIndiceGlobalDocentes(?float $value): void
    {
        $this->setAttribute('indice_global_docentes', $value);
    }

    public function setDocentesEncuestadosCd(?int $value): void
    {
        $this->setAttribute('docentes_encuestados_cd', $value);
    }

    public function setIndiceGlobalIcfes(?float $value): void
    {
        $this->setAttribute('indice_global_icfes', $value);
    }

    public function setEncuestadosIcfes(?int $value): void
    {
        $this->setAttribute('encuestados_icfes', $value);
    }

    public function setIndiceGlobalEstudiantes(?float $value): void
    {
        $this->setAttribute('indice_global_estudiantes', $value);
    }

    public function setEncuestadosEstudiantes(?int $value): void
    {
        $this->setAttribute('encuestados_estudiantes', $value);
    }

    public function setIndiceGlobalCiberseguridad(?float $value): void
    {
        $this->setAttribute('indice_global_ciberseguridad', $value);
    }

    public function setEncuestadosCiberseguridad(?int $value): void
    {
        $this->setAttribute('encuestados_ciberseguridad', $value);
    }
}