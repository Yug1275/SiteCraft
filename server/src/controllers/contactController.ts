import { Response, Request } from 'express';
import { supabase } from '../config/supabase';

export const submitContact = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      res.status(400).json({ error: 'Name, email, and message are required' });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        message,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: 'Failed to submit contact message' });
      return;
    }

    res.status(201).json({ 
      message: 'Contact message submitted successfully',
      data 
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getContactMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: 'Failed to fetch contact messages' });
      return;
    }

    res.json({ messages: data });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
