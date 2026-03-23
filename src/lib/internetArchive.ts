/**
 * Internet Archive S3-like API integration
 * Docs: https://archive.org/developers/ias3.html
 *
 * URL convention: ia://<identifier>/<filename>
 * Resolves to:   https://archive.org/download/<identifier>/<filename>
 */

const IA_S3_ENDPOINT = 'https://s3.us.archive.org';

function getIACredentials(): { accessKey: string; secretKey: string } {
    const accessKey = import.meta.env.PUBLIC_IA_ACCESS_KEY;
    const secretKey = import.meta.env.PUBLIC_IA_SECRET_KEY;
    if (!accessKey || !secretKey) {
        throw new Error('Internet Archive credentials not configured. Set PUBLIC_IA_ACCESS_KEY and PUBLIC_IA_SECRET_KEY in .env');
    }
    return { accessKey, secretKey };
}

/**
 * Generate a unique Internet Archive item identifier.
 */
function generateItemIdentifier(speakerSlug?: string): string {
    const shortId = crypto.randomUUID().replace(/-/g, '').substring(0, 10);
    if (speakerSlug) {
        const slug = speakerSlug
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .toLowerCase()
            .substring(0, 40);
        if (slug.length >= 3) {
            return `fikreislam-${slug}-${shortId}`;
        }
    }
    return `fikreislam-audio-${shortId}`;
}

/**
 * Sanitize a filename for safe use in Internet Archive URLs.
 */
function sanitizeFileName(name: string): string {
    return name
        .replace(/\s+/g, '_')
        .replace(/[^\w.\-\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g, '_')
        .replace(/_+/g, '_');
}

export interface IAUploadResult {
    identifier: string;
    fileName: string;
    iaUrl: string;
    downloadUrl: string;
}

/**
 * Upload a file to Internet Archive
 */
export async function uploadToInternetArchive(
    file: File,
    metadata: {
        speaker?: string;
        audioType?: string;
        title?: string;
        existingIdentifier?: string;
    },
    signal?: AbortSignal
): Promise<IAUploadResult> {
    const { accessKey, secretKey } = getIACredentials();
    const identifier = metadata.existingIdentifier || generateItemIdentifier(metadata.speaker);
    const fileName = sanitizeFileName(file.name);

    const encMeta = (value: string): string => {
        if (/[^\x00-\x7F]/.test(value)) {
            return `uri(${encodeURIComponent(value)})`;
        }
        return value;
    };

    const title = metadata.title || fileName;
    const description = `Audio content from Fikr-e-Islam${metadata.speaker ? ` by ${metadata.speaker}` : ''}`;

    const headers: Record<string, string> = {
        'Authorization': `LOW ${accessKey}:${secretKey}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-amz-auto-make-bucket': '1',
        'x-archive-meta-mediatype': 'audio',
        'x-archive-meta-collection': 'opensource_audio',
        'x-archive-meta-title': encMeta(title),
        'x-archive-meta-description': encMeta(description),
    };

    if (metadata.speaker) {
        headers['x-archive-meta-creator'] = encMeta(metadata.speaker);
    }
    if (metadata.audioType) {
        headers['x-archive-meta-subject'] = encMeta(metadata.audioType);
    }

    const uploadUrl = `${IA_S3_ENDPOINT}/${identifier}/${encodeURIComponent(fileName)}`;

    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers,
        body: file,
        signal,
    });

    if (!response.ok) {
        let errorDetail = '';
        try {
            errorDetail = await response.text();
        } catch { /* ignore */ }
        throw new Error(`Internet Archive upload failed (${response.status}): ${errorDetail || response.statusText}`);
    }

    const iaUrl = `ia://${identifier}/${fileName}`;
    const downloadUrl = `https://archive.org/download/${identifier}/${encodeURIComponent(fileName)}`;

    return { identifier, fileName, iaUrl, downloadUrl };
}

/**
 * Delete a file from Internet Archive.
 */
export async function deleteFromInternetArchive(iaUrl: string): Promise<boolean> {
    if (!iaUrl || !iaUrl.startsWith('ia://')) return false;

    const path = iaUrl.replace('ia://', '');
    const slashIndex = path.indexOf('/');
    if (slashIndex === -1) return false;

    const identifier = path.substring(0, slashIndex);
    const fileName = path.substring(slashIndex + 1);

    if (!identifier || !fileName) return false;

    try {
        const { accessKey, secretKey } = getIACredentials();

        const response = await fetch(
            `${IA_S3_ENDPOINT}/${identifier}/${encodeURIComponent(fileName)}`,
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `LOW ${accessKey}:${secretKey}`,
                    'x-archive-cascade-delete': '1',
                },
            }
        );

        return response.ok;
    } catch (error) {
        console.error('Error deleting from Internet Archive:', error);
        return false;
    }
}

export function resolveIADownloadUrl(iaUrl: string): string {
    if (!iaUrl || !iaUrl.startsWith('ia://')) return '';
    const path = iaUrl.replace('ia://', '');
    const slashIndex = path.indexOf('/');
    if (slashIndex === -1) return `https://archive.org/download/${path}`;
    const identifier = path.substring(0, slashIndex);
    const fileName = path.substring(slashIndex + 1);
    return `https://archive.org/download/${identifier}/${encodeURIComponent(fileName)}`;
}

export function resolveIAItemUrl(iaUrl: string): string {
    if (!iaUrl || !iaUrl.startsWith('ia://')) return '';
    const path = iaUrl.replace('ia://', '');
    const identifier = path.split('/')[0];
    return `https://archive.org/details/${identifier}`;
}
