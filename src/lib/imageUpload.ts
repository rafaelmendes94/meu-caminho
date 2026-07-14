// Validação segura + compressão + conversão WebP para uploads de branding.
// Sem dependências externas — usa File API + Canvas.

export const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_EXT = ["png", "jpg", "jpeg", "webp"];
export const ALLOWED_MIME = ["image/png", "image/jpeg", "image/webp"];

// Assinaturas mágicas dos formatos suportados
async function detectMimeByMagic(file: File): Promise<string | null> {
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  // PNG 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  // JPEG FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  // WEBP: "RIFF"...."WEBP"
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return "image/webp";
  return null;
}

export type ValidatedImage = { file: Blob; mime: string; ext: string };

export async function validateAndCompressImage(file: File, opts?: { maxSide?: number; quality?: number; preferWebp?: boolean }): Promise<ValidatedImage> {
  if (file.size > MAX_BYTES) {
    throw new Error("Imagem acima de 2 MB. Reduza o tamanho antes de enviar.");
  }
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) {
    throw new Error(`Extensão inválida. Aceitos: ${ALLOWED_EXT.join(", ").toUpperCase()}.`);
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    throw new Error("Tipo MIME não permitido.");
  }
  const magic = await detectMimeByMagic(file);
  if (!magic) throw new Error("Assinatura da imagem não pôde ser verificada.");
  if (magic !== file.type) {
    throw new Error("Conteúdo da imagem não corresponde ao tipo informado.");
  }

  const maxSide = opts?.maxSide ?? 1600;
  const quality = opts?.quality ?? 0.85;
  const preferWebp = opts?.preferWebp ?? true;

  // Carregar imagem — a decodificação via canvas descarta metadados EXIF.
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) throw new Error("Falha ao processar imagem.");
  let w = bitmap.width, h = bitmap.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  w = Math.round(w * scale);
  h = Math.round(h * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponível.");
  ctx.drawImage(bitmap, 0, 0, w, h);

  const outMime = preferWebp ? "image/webp" : magic;
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outMime, quality));
  if (!blob) throw new Error("Falha ao comprimir imagem.");

  const outExt = outMime === "image/webp" ? "webp" : outMime === "image/png" ? "png" : "jpg";
  return { file: blob, mime: outMime, ext: outExt };
}