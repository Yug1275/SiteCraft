import { supabase } from '../config/supabase';

type EnsureUserInput = {
  userId: string;
  email?: string;
  name?: string;
};

export const ensureUserExists = async ({ userId, email, name }: EnsureUserInput): Promise<string> => {
  const fallbackEmail = email || `${userId}@sitecraft.local`;
  const fallbackName = name || fallbackEmail.split('@')[0] || 'User';

  const { data: existingById, error: idLookupError } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (idLookupError) {
    throw idLookupError;
  }

  if (existingById?.id) {
    return existingById.id;
  }

  const { data: existingByEmail, error: emailLookupError } = await supabase
    .from('users')
    .select('id')
    .eq('email', fallbackEmail)
    .maybeSingle();

  if (emailLookupError) {
    throw emailLookupError;
  }

  if (existingByEmail?.id) {
    const { error: updateError } = await supabase
      .from('users')
      .update({ name: fallbackName, provider: 'supabase' })
      .eq('id', existingByEmail.id);

    if (updateError) {
      throw updateError;
    }

    return existingByEmail.id;
  }

  const { error } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        email: fallbackEmail,
        name: fallbackName,
        provider: 'supabase',
      },
      { onConflict: 'id' }
    );

  if (error) {
    throw error;
  }

  return userId;
};
