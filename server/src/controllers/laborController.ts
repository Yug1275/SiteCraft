import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getLabor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { project_id } = req.query;
    let query = supabase
      .from('labor')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id as string);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch labor' });
      return;
    }

    res.json({ labor: data });
  } catch (error) {
    console.error('Get labor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createLabor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, phone, role, hourly_rate, daily_wage, project_id } = req.body;

    if (!name || !role) {
      res.status(400).json({ error: 'Name and role are required' });
      return;
    }

    const { data, error } = await supabase
      .from('labor')
      .insert({
        name,
        phone: phone || '',
        role,
        hourly_rate: hourly_rate || 0,
        daily_wage: daily_wage || (hourly_rate ? hourly_rate * 8 : 0),
        project_id: project_id || null,
        user_id: req.user!.id,
        is_present: false,
        check_in_time: null,
        check_out_time: null,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to add worker' });
      return;
    }

    res.status(201).json({ worker: data });
  } catch (error) {
    console.error('Create labor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLabor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('labor')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update worker' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Worker not found' });
      return;
    }

    res.json({ worker: data });
  } catch (error) {
    console.error('Update labor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteLabor = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('labor')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      res.status(500).json({ error: 'Failed to remove worker' });
      return;
    }

    res.json({ message: 'Worker removed successfully' });
  } catch (error) {
    console.error('Delete labor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
