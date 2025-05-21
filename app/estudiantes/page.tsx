import { TablaEstudiantes } from "./tabla-estudiantes"

export default function EstudiantesPage() {
    return (
        <main className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Sistema de estudiantes</h1>
            <p className="text-muted-foreground mb-6">
                Haz clic en la matrícula de cualquier estudiante para ver sus detalles completos, 
                editarlo o eliminarlo. Despliega las calificaciones con el icono de la flecha
                a la izquierda de la matrícula. Para crear un nuevo estudiante, usa el botón 
                Nuevo Estudiante.
            </p>
            <TablaEstudiantes />
        </main>
    )
}