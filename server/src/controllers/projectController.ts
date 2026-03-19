import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', req.user!.id)
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

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, location, description, budget, start_date, end_date, manager } = req.body;

    if (!name || !location) {
      res.status(400).json({ error: 'Name and location are required' });
      return;
    }

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
        user_id: req.user!.id,
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to create project' });
      return;
    }

    res.status(201).json({ project: data });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user!.id)
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

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

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
