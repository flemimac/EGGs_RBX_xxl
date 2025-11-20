const MAX_FILE_SIZE = 100 * 1024 * 1024;
const MAX_IMAGE_SIZE = 50 * 1024 * 1024;
const MAX_RESOLUTION = 7680;

const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/tiff',
  'image/tif',
];

const SUPPORTED_RAW_EXTENSIONS = [
  '.dng',
  '.cr2',
  '.cr3',
  '.nef',
  '.arw',
  '.rw2',
  '.orf',
  '.raf',
  '.srw',
  '.x3f',
  '.3fr',
  '.mef',
  '.mos',
  '.ari',
  '.srf',
  '.sr2',
  '.bay',
  '.cap',
  '.iiq',
  '.eip',
  '.dcs',
  '.drf',
  '.k25',
  '.kdc',
  '.dng',
];

const DJI_RAW_EXTENSIONS = [
  '.dng',
  '.raw',
];

const AUTEL_RAW_EXTENSIONS = [
  '.dng',
  '.raw',
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export const validateFile = async (file: File): Promise<ValidationResult> => {
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  const isImage = SUPPORTED_IMAGE_FORMATS.includes(file.type);
  const isRaw = SUPPORTED_RAW_EXTENSIONS.includes(fileExtension) ||
    DJI_RAW_EXTENSIONS.includes(fileExtension) ||
    AUTEL_RAW_EXTENSIONS.includes(fileExtension);

  if (!isImage && !isRaw) {
    return {
      valid: false,
      error: `Неподдерживаемый формат файла. Поддерживаются: JPG, PNG, TIFF и RAW-форматы (DJI, Autel и др.)`,
    };
  }

  const maxSize = isRaw ? MAX_FILE_SIZE : MAX_IMAGE_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / (1024 * 1024));
    return {
      valid: false,
      error: `Файл слишком большой. Максимальный размер: ${maxSizeMB}MB`,
    };
  }

  if (isImage) {
    const resolution = await getImageResolution(file);
    if (resolution) {
      const maxDimension = Math.max(resolution.width, resolution.height);
      if (maxDimension > MAX_RESOLUTION) {
        return {
          valid: false,
          error: `Разрешение изображения превышает 8K (${MAX_RESOLUTION}px). Текущее: ${maxDimension}px`,
        };
      }
    }
  }

  return { valid: true };
};

const getImageResolution = (file: File): Promise<{ width: number; height: number } | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
};

export const validateFiles = async (files: File[]): Promise<{ valid: File[]; errors: string[] }> => {
  const validFiles: File[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await validateFile(file);
    if (result.valid) {
      validFiles.push(file);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  }

  return { valid: validFiles, errors };
};

