import { Info, ExternalLink } from "lucide-react";

export function AlertHelp() {
    return (
        <div className="
  rounded-xl border p-4 transition-all
  border-blue-200 bg-blue-50/60 hover:bg-blue-50
  dark:border-blue-900/40 dark:bg-blue-950/40 dark:hover:bg-blue-950/60
">
            <div className="flex gap-3">
                {/* Icono con un color de énfasis sutil */}
                <div className="shrink-0">
                    <Info className="h-5 w-5 text-blue-600" />
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100 leading-none">
                        ¿Necesitas ayuda con tus archivos?
                    </span>

                    <p className="text-xs leading-relaxed text-blue-800/80 dark:text-blue-200/80">
                        Los documentos deben ser en formato <strong>PDF</strong> y pesar menos de <strong>10MB</strong> para asegurar una carga rápida.
                    </p>

                    {/* Link mejor integrado */}
                    <div className="mt-2">
                        <a
                            href="https://www.ilovepdf.com/es/comprimir_pdf"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 underline-offset-4 hover:underline transition-colors"
                        >
                            Comprimir mi PDF aquí
                            <ExternalLink className="h-3 w-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}