import { useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface UploadZoneProps {
    code?: string;
    onUpload: (file: File) => void;
}

export default function UploadZone({ code, onUpload }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="w-full max-w-md">
            <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) onUpload(file);
                }}
                className={`flex flex-col items-center justify-center w-full h-52 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-muted-foreground/25 bg-muted/30 hover:bg-muted/50'
                    }`}
            >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                    <div className="p-3 bg-background rounded-full shadow-sm mb-4">
                        <UploadCloud className={`size-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <p className="mb-1 text-sm font-semibold">
                        Haz clic para subir o arrastra tu archivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Solo archivos PDF (Máx. 10MB)
                    </p>
                </div>
                <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUpload(file);
                    }}
                />
            </label>
        </div>
    );
}
