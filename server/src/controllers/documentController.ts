import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for disk storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const authReq = req as AuthRequest;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, (authReq.user?.id || 'anon') + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
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

export const getDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project_id } = req.query;
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', req.user!.id)
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

export const uploadDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const file = req.file;
    const { name, category, project_id } = req.body;

    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'Document name is required' });
      return;
    }

    // Get public URL
    const publicUrl = `${process.env.API_URL || 'http://localhost:5000'}/uploads/${file.filename}`;

    // Save document metadata
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    let fileType = 'document';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) fileType = 'image';
    else if (['xls', 'xlsx', 'csv'].includes(ext)) fileType = 'spreadsheet';
    else if (ext === 'pdf') fileType = 'pdf';

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
        user_id: req.user!.id,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to save document metadata' });
      return;
    }

    res.status(201).json({ document: data });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Get document to find the file path
    const { data: doc } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (doc?.file_url) {
      // Extract file path from URL for deletion
      const filename = doc.file_url.split('/uploads/')[1];
      if (filename) {
        const filePath = path.join(__dirname, '../../uploads', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

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
