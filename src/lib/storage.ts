import { resolveIADownloadUrl, resolveIAItemUrl } from './internetArchive';
import type { ContentItem } from './types';

/**
 * Resolve a stored URL to a usable URL.
 * Since we no longer use Supabase storage, this simply returns the URL as-is
 * or resolves Internet Archive / Google Drive URLs.
 */
export async function getSignedUrl(
  path: string | null,
  expiresIn: number = 3600,
  options?: { transform?: { width: number, height: number } }
): Promise<string | null> {
  if (!path) return null;
  // All URLs are now direct (IA, Google Drive, or any external URL)
  return path;
}

export async function withSignedUrls(items: ContentItem[]): Promise<ContentItem[]> {
  // No transformation needed since we no longer use Supabase signed URLs
  return items;
}

/**
 * Google Drive Utilities via Apps Script Bridge
 */

const getGASUrl = () => import.meta.env.PUBLIC_GOOGLE_APPS_SCRIPT_URL;

export async function deleteFromGoogleDrive(fileUrl: string | null): Promise<boolean> {
  if (!fileUrl || !fileUrl.startsWith('google-drive://')) return false;
  const fileId = fileUrl.replace('google-drive://', '');

  try {
    const gasUrl = getGASUrl();
    if (!gasUrl) return false;

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'delete', fileId }),
    });

    const result = await response.json();
    return result.status === 'success';
  } catch (error) {
    console.error('Error deleting from Google Drive:', error);
    return false;
  }
}

export async function createFolderInGoogleDrive(folderPath: string): Promise<{ success: boolean, folderId?: string, message?: string }> {
  try {
    const gasUrl = getGASUrl();
    if (!gasUrl) return { success: false, message: 'GAS URL not configured' };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'createFolder', folderPath }),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      folderId: result.folderId,
      message: result.message || result.error
    };
  } catch (error: any) {
    console.error('Error creating folder in Google Drive:', error);
    return { success: false, message: error.message || 'Network error' };
  }
}

export async function moveFileInGoogleDrive(fileId: string, folderId: string): Promise<{ success: boolean, message?: string }> {
  try {
    const gasUrl = getGASUrl();
    if (!gasUrl) return { success: false, message: 'GAS URL not configured' };

    const response = await fetch(gasUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'moveFile', fileId, folderId }),
    });

    const result = await response.json();
    return {
      success: result.status === 'success',
      message: result.message || result.error
    };
  } catch (error: any) {
    console.error('Error moving file in Google Drive:', error);
    return { success: false, message: error.message || 'Network error' };
  }
}

export function resolveExternalUrl(url: string | null): string {
  if (!url) return '';
  if (url.includes('ia://')) return resolveIADownloadUrl(url);
  if (url.includes('google-drive://')) {
    const fileId = url.replace('google-drive://', '').split('?')[0];
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
  return url;
}

export function resolveItemPageUrl(url: string | null): string {
  if (!url) return '';
  if (url.includes('ia://')) return resolveIAItemUrl(url);
  if (url.includes('google-drive://')) {
    const fileId = url.replace('google-drive://', '').split('?')[0];
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
  return url;
}
