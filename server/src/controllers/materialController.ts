import { Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { ensureUserExists } from '../utils/ensureUser';

export const getMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id } = req.query;
      let query = supabase
      .from('materials')
      .select('*')
      .order('created_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id as string);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch materials' });
      return;
    }

    res.json({ materials: data });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, current_stock, minimum_stock, unit, unit_price, supplier, project_id, user_id, user_email, user_name } = req.body;

    if (!name || !unit || !user_id) {
      res.status(400).json({ error: 'Name, unit and user_id are required' });
      return;
    }

    const resolvedUserId = await ensureUserExists({ userId: user_id, email: user_email, name: user_name });

    const { data, error } = await supabase
      .from('materials')
      .insert({
        name,
        category: category || 'General',
        current_stock: current_stock || 0,
        minimum_stock: minimum_stock || 0,
        unit,
        unit_price: unit_price || 0,
        supplier: supplier || '',
        project_id: project_id || null,
        user_id: resolvedUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Create material supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to create material' });
      return;
    }

    res.status(201).json({ material: data });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update material' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Material not found' });
      return;
    }

    res.json({ material: data });
  } catch (error) {
    console.error('Update material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: 'Failed to delete material' });
      return;
    }

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Delete material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
