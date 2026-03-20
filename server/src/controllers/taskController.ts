import { Response, Request } from 'express';
import { supabase } from '../config/supabase';
import { ensureUserExists } from '../utils/ensureUser';

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { project_id, status } = req.query;
      let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (project_id) {
      query = query.eq('project_id', project_id as string);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status as string);
    }

    const { data, error } = await query;

    if (error) {
      res.status(500).json({ error: 'Failed to fetch tasks' });
      return;
    }

    res.json({ tasks: data });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, status: taskStatus, priority, assignee, due_date, project_id, user_id, user_email, user_name } = req.body;

    if (!title || !user_id) {
      res.status(400).json({ error: 'Title and user_id are required' });
      return;
    }

    const resolvedUserId = await ensureUserExists({ userId: user_id, email: user_email, name: user_name });

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || '',
        status: taskStatus || 'Pending',
        priority: priority || 'Medium',
        assignee: assignee || '',
        due_date: due_date || null,
        progress: 0,
        project_id: project_id || null,
        user_id: resolvedUserId,
      })
      .select()
      .single();

    if (error) {
      console.error('Create task supabase error:', error);
      res.status(500).json({ error: error.message || 'Failed to create task' });
      return;
    }

    res.status(201).json({ task: data });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Auto-set progress based on status
    if (updates.status === 'Completed') {
      updates.progress = 100;
    } else if (updates.status === 'In Progress' && (!updates.progress || updates.progress === 0)) {
      updates.progress = 25;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: 'Failed to update task' });
      return;
    }

    if (!data) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    res.json({ task: data });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      res.status(500).json({ error: 'Failed to delete task' });
      return;
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
