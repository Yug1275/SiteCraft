import { Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { ensureUserExists } from '../utils/ensureUser';

export const getLabor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id } = req.query;
      let query = supabase
      .from('labor')
      .select('*')
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

export const createLabor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, phone, role, hourly_rate, daily_wage, project_id, user_id, user_email, user_name } = req.body;

    if (!name || !role || !user_id) {
      res.status(400).json({ error: 'Name, role and user_id are required' });
      return;
    }

    const resolvedUserId = await ensureUserExists({ userId: user_id, email: user_email, name: user_name });

    const { data, error } = await supabase
      .from('labor')
      .insert({
        name,
        phone: phone || '',
        role,
        hourly_rate: hourly_rate || 0,
        daily_wage: daily_wage || (hourly_rate ? hourly_rate * 8 : 0),
        project_id: project_id || null,
        user_id: resolvedUserId,
        is_present: false,
        check_in_time: null,
        check_out_time: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Create labor supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to add worker' });
      return;
    }

    res.status(201).json({ worker: data });
  } catch (error) {
    console.error('Create labor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLabor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('labor')
      .update(updates)
      .eq('id', id)
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

export const deleteLabor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('labor')
      .delete()
      .eq('id', id);

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
