import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project_id } = req.query;
    let query = supabase
      .from('materials')
      .select('*')
      .eq('user_id', req.user!.id)
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

export const createMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, category, current_stock, minimum_stock, unit, unit_price, supplier, project_id } = req.body;

    if (!name || !unit) {
      res.status(400).json({ error: 'Name and unit are required' });
      return;
    }

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
        user_id: req.user!.id,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to create material' });
      return;
    }

    res.status(201).json({ material: data });
  } catch (error) {
    console.error('Create material error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('materials')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user!.id)
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

export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

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
