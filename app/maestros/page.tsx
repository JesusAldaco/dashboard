import { TablaMaestros } from "./tabla-maestros"

export default function MaestosPage() {
    return (
        <main className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-6">Sistema de Maestros</h1>
            <p className="text-muted-foreground mb-6">
                Haz clic en cualquiera de los maestros para ver sus detalles o editar su información. Para crear un nuevo maestro, haz clic en el botón Nuevo maestro.
            </p>
            <TablaMaestros />
        </main>
    )
}