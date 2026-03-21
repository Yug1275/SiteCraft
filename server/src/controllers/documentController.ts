import { Response, Request } from 'express';
import { supabase } from '../config/supabase';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ensureUserExists } from '../utils/ensureUser';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const DOCUMENTS_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'documents';

const getStoragePathFromPublicUrl = (fileUrl: string) => {
  const marker = `/storage/v1/object/public/${DOCUMENTS_BUCKET}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(fileUrl.slice(idx + marker.length));
};

const getLegacyUploadFilename = (fileUrl: string) => {
  const marker = '/uploads/';
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(fileUrl.slice(idx + marker.length));
};

// Configure multer for memory storage before uploading to Supabase Storage.
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'));
    }
  },
});

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id } = req.query;
    let query = supabase
      .from('documents')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id as string);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch documents' });
      return;
    }

    res.json({ documents: data });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { name, category, project_id, user_id, user_email, user_name } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!name || !user_id) {
      res.status(400).json({ error: 'Document name and user_id are required' });
      return;
    }

    const resolvedUserId = await ensureUserExists({ userId: user_id, email: user_email, name: user_name });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    const storagePath = `${resolvedUserId}/${uniqueSuffix}${ext}`;

    const { error: storageError } = await supabase
      .storage
      .from(DOCUMENTS_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (storageError) {
      console.error('Supabase storage upload error:', storageError);
      res.status(500).json({ error: storageError.message || 'Failed to upload file to storage' });
      return;
    }

    const { data: publicUrlData } = supabase
      .storage
      .from(DOCUMENTS_BUCKET)
      .getPublicUrl(storagePath);

    const publicUrl = publicUrlData.publicUrl;

    // Save document metadata
    const fileExt = ext.replace('.', '');
    let fileType = 'document';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExt)) fileType = 'image';
    else if (['xls', 'xlsx', 'csv'].includes(fileExt)) fileType = 'spreadsheet';
    else if (fileExt === 'pdf') fileType = 'pdf';

    const { data, error } = await supabase
      .from('documents')
      .insert({
        name,
        file_name: file.originalname,
        file_url: publicUrl,
        file_size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        file_type: fileType,
        category: category || 'General',
        project_id: project_id || null,
        user_id: resolvedUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Upload document supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to save document metadata' });
      return;
    }

    res.status(201).json({ document: data });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get document to find the file path
    const { data: doc } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .single();

    if (doc?.file_url) {
      const storagePath = getStoragePathFromPublicUrl(doc.file_url);
      if (storagePath) {
        const { error: removeError } = await supabase
          .storage
          .from(DOCUMENTS_BUCKET)
          .remove([storagePath]);

        if (removeError) {
          console.error('Supabase storage remove error:', removeError);
        }
      } else {
        // Backward compatibility for older local /uploads files.
        const filename = getLegacyUploadFilename(doc.file_url);
        if (filename) {
          const filePath = path.join(__dirname, '../../uploads', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: 'Failed to delete document' });
      return;
    }

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
