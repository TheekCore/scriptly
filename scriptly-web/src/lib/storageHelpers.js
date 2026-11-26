import { supabase } from "./supabase.js";

/**
 * Uploads an array of resized image files to the private 'uploads' Supabase bucket.
 * Files are stored inside the student's isolated folder: <user_id>/<timestamp>_<random>.jpg
 * 
 * @param {string} userId - Authenticated student UUID
 * @param {Array<File>} files - Resized image files to upload
 * @returns {Promise<Array<string>>} - Array of storage paths (e.g. ['user-id/123_abc.jpg'])
 */
export async function uploadNoteImages(userId, files = []) {
  if (!userId || !files || files.length === 0) return [];

  const uploadedPaths = [];

  for (const file of files) {
    // Generate a collision-resistant path inside the user's folder
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const filePath = `${userId}/${Date.now()}_${randomSuffix}.jpg`;

    const { data, error } = await supabase.storage
      .from("uploads")
      .upload(filePath, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error(`Failed to upload image ${filePath}:`, error.message);
      // Continue uploading remaining images even if one fails
    } else if (data?.path) {
      uploadedPaths.push(data.path);
    }
  }

  return uploadedPaths;
}

/**
 * Deletes photos from the Supabase Storage 'uploads' bucket when a note is deleted.
 * 
 * @param {Array<string>} imagePaths - Array of relative storage paths
 * @returns {Promise<void>}
 */
export async function deleteNoteImages(imagePaths = []) {
  if (!imagePaths || imagePaths.length === 0) return;

  try {
    const { error } = await supabase.storage
      .from("uploads")
      .remove(imagePaths);

    if (error) {
      console.warn("Failed to remove storage photos:", error.message);
    }
  } catch (err) {
    console.error("Storage delete error:", err);
  }
}

/**
 * Creates temporary secure signed URLs for private images so they can be rendered in the browser.
 * 
 * @param {Array<string>} imagePaths - Array of relative storage paths
 * @param {number} expiresIn - Expiry time in seconds (default 3600 = 1 hour)
 * @returns {Promise<Array<{ path: string, signedUrl: string }>>}
 */
export async function getNoteSignedImageUrls(imagePaths = [], expiresIn = 3600) {
  if (!imagePaths || imagePaths.length === 0) return [];

  try {
    const results = await Promise.all(
      imagePaths.map(async (path) => {
        const { data, error } = await supabase.storage
          .from("uploads")
          .createSignedUrl(path, expiresIn);

        if (error || !data?.signedUrl) {
          console.warn(`Could not get signed URL for ${path}:`, error?.message);
          return null;
        }

        return { path, signedUrl: data.signedUrl };
      })
    );

    return results.filter(Boolean);
  } catch (err) {
    console.error("Error creating signed image URLs:", err);
    return [];
  }
}
