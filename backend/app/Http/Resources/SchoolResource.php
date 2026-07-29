<?php 

namespace App\Http\Resources; 

use Illuminate\Http\Request; 
use Illuminate\Http\Resources\Json\JsonResource; 

class SchoolResource extends JsonResource 
{ 
    public function toArray(Request $request): array
    {
        return [
            'cod_dane'                     => $this->getCodDane(),
            'nombre_institucion'           => $this->getNombreInstitucion(),
            'sede_principal'               => $this->getSedePrincipal(),
            'coordinates'                  => [$this->getLatitud(), $this->getLongitud()],
            'correo_institucional'         => $this->getCorreoInstitucional(),
            'telefono'                     => $this->getTelefono(),
            'direccion'                    => $this->getDireccion(),
            'calendario'                   => $this->getCalendario(),
            'naturaleza'                   => $this->getNaturaleza(),
            'sector'                       => $this->getSector(),
            'zona'                         => $this->getZona(),
            'jornada'                      => $this->getJornada(),
            'nivel'                        => $this->getNivel(),
            'indice_global_stem'           => $this->getIndiceGlobalStem(),
            'docentes_encuestados_stem'    => $this->getDocentesEncuestadosStem(),
            'indice_global_docentes'       => $this->getIndiceGlobalDocentes(),
            'docentes_encuestados_cd'      => $this->getDocentesEncuestadosCd(),
            'indice_global_icfes'          => $this->getIndiceGlobalIcfes(),
            'encuestados_icfes'            => $this->getEncuestadosIcfes(),
            'indice_global_estudiantes'    => $this->getIndiceGlobalEstudiantes(),
            'encuestados_estudiantes'      => $this->getEncuestadosEstudiantes(),
            'indice_global_ciberseguridad' => $this->getIndiceGlobalCiberseguridad(),
            'encuestados_ciberseguridad'   => $this->getEncuestadosCiberseguridad(),
        ];
    }

} 