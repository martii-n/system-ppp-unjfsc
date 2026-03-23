import React, { useState } from 'react';
import { UploadCloud, FileUp } from 'lucide-react';

export default function UploadZone({ code, onUpload }: any) {
    const [isDragging, setIsDragging] = useState(false);

    return (
        <div className="w-full max-w-md">
            <label
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${isDragging
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
                <input type="file" className="hidden" accept=".pdf"
                    onChange={(e) => onUpload(e.target.files?.[0])}
                />
            </label>
        </div>
    );
}
