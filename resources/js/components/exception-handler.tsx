import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';

export function ExceptionHandler() {
    const { flash } = usePage().props as any;
    const error = flash?.error;
    const success = flash?.success || flash?.message;

    useEffect(() => {
        if (success) {
            toast.success(success, {
                id: `flash-success-${success}`, // Evita duplicados con el mismo contenido
            });
        }
    }, [success]);

    useEffect(() => {
        if (!error) return;

        // Lógica por familias (Status)
        switch (error.status) {
            case 409: // Conflictos de lógica (Business Exceptions)
            case 209: // Códigos personalizados
                toast.error(error.message, {
                    description: `Código: ${error.code}`,
                    duration: 6000,
                });
                break;

            case 403: // Prohibido
                toast.warning('Acceso denegado', {
                    description: error.message,
                });
                break;

            case 404: // No encontrado
                toast.info('No encontrado', {
                    description: error.message,
                });
                break;

            default:
                toast.error('Ocurrió un error', {
                    description: error.message,
                });
        }
    }, [error]);

    return null;
}
