import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/auth';

// POST — Admin: upload image to Supabase Storage
export async function POST(request: NextRequest) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucket = (formData.get('bucket') as string) || 'products'; // 'products' | 'testimonials'

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      return Response.json({ error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    const ext = file.name.split('.').pop();
    const filename = `${crypto.randomUUID()}_${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filename, arrayBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return Response.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filename);

    return Response.json({ url: publicUrl, filename });
  } catch {
    return Response.json({ error: 'Upload failed' }, { status: 500 });
  }
}
