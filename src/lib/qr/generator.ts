import QRCode from 'qrcode';

export type QrGeneratorOptions = {
  size?: number;
  logoUrl?: string;
};

// Alias for backwards compatibility
export async function generateQrCode(url: string, options: QrGeneratorOptions = {}): Promise<string> {
  return generateQrCodeBase64(url, options);
}

export async function generateQrCodeBase64(
  url: string,
  options: QrGeneratorOptions = {}
): Promise<string> {
  const { size = 300 } = options;

  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });

    return dataUrl;
  } catch (error) {
    console.error('QR generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQrCodeBuffer(
  url: string,
  options: QrGeneratorOptions = {}
): Promise<Buffer> {
  const { size = 300 } = options;

  try {
    const buffer = await QRCode.toBuffer(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
      type: 'png',
    });

    return buffer;
  } catch (error) {
    console.error('QR generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function buildFeedbackUrl(slug: string, location?: string, reminderId?: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const params = new URLSearchParams();
  if (location) params.set('location', location);
  if (reminderId) params.set('rid', reminderId);
  const queryString = params.toString();
  return `${baseUrl}/${slug}/feedback${queryString ? `?${queryString}` : ''}`;
}
