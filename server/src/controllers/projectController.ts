import { Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { ensureUserExists } from '../utils/ensureUser';

export const getProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch projects' });
      return;
    }

    res.json({ projects: data });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, location, description, budget, start_date, end_date, manager, user_id, user_email, user_name } = req.body;

    if (!name || !location || !user_id) {
      res.status(400).json({ error: 'Name, location and user_id are required' });
      return;
    }

    const resolvedUserId = await ensureUserExists({ userId: user_id, email: user_email, name: user_name });

    const { data, error } = await supabase
      .from('projects')
      .insert({
        name,
        location,
        description: description || '',
        budget: budget || 0,
        start_date: start_date || null,
        end_date: end_date || null,
        status: 'On Track',
        progress: 0,
        manager: manager || null,
        user_id: resolvedUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Create project supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to create project' });
      return;
    }

    res.status(201).json({ project: data });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update project' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({ project: data });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: 'Failed to delete project' });
      return;
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
