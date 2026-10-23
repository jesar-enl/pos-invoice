'use client';

import { useRef, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateLogo } from '@/features/settings/actions';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

export function LogoUploader({
    currentUrl,
    tenantId,
}: {
    currentUrl: string | null;
    tenantId: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isPending, startTransition] = useTransition();
    const [preview, setPreview] = useState<string | null>(currentUrl);

    async function handleFile(file: File) {
        if (!ALLOWED.includes(file.type)) {
            toast.error('Only PNG, JPG, WEBP, or SVG allowed');
            return;
        }
        if (file.size > MAX_BYTES) {
            toast.error('File is larger than 2MB');
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        startTransition(async () => {
            const supabase = createClient();
            const ext = file.name.split('.').pop() || 'png';
            const path = `${tenantId}/logo-${Date.now()}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from('logos')
                .upload(path, file, { upsert: true, cacheControl: '3600' });

            if (upErr) {
                toast.error('Upload failed', { description: upErr.message });
                setPreview(currentUrl);
                return;
            }

            const { data: pub } = supabase.storage.from('logos').getPublicUrl(path);
            const url = pub.publicUrl;

            const result = await updateLogo(url);
            if (result.error) {
                toast.error(result.error);
                setPreview(currentUrl);
                return;
            }

            setPreview(url);
            toast.success('Logo updated');
        });
    }

    function handleRemove() {
        if (!confirm('Remove the logo?')) return;
        startTransition(async () => {
            const result = await updateLogo('');
            if (result.error) {
                toast.error(result.error);
                return;
            }
            setPreview(null);
            toast.success('Logo removed');
        });
    }

    return (
        <div className="flex items-start gap-4">
            <div className="h-24 w-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt="Logo preview"
                        className="max-h-full max-w-full object-contain"
                    />
                ) : (
                    <span className="text-xs text-slate-400">No logo</span>
                )}
            </div>

            <div className="flex-1 space-y-2">
                <p className="text-sm text-slate-600">
                    PNG, JPG, WEBP, or SVG. Max 2MB. Transparent background works best.
                </p>
                <div className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ALLOWED.join(',')}
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) void handleFile(file);
                            e.target.value = '';
                        }}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => inputRef.current?.click()}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                Uploading…
                            </>
                        ) : (
                            <>
                                <Upload className="h-3.5 w-3.5 mr-1.5" />
                                {preview ? 'Replace logo' : 'Upload logo'}
                            </>
                        )}
                    </Button>
                    {preview && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={isPending}
                            onClick={handleRemove}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Remove
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}