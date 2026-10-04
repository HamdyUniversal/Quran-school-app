create or replace function private.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_locale text;
  requested_name text;
begin
  requested_locale := new.raw_user_meta_data ->> 'preferred_locale';
  requested_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');

  insert into public.profiles (id, display_name, preferred_locale)
  values (
    new.id,
    coalesce(requested_name, nullif(split_part(coalesce(new.email, ''), '@', 1), ''), 'User'),
    case when requested_locale in ('ar', 'en') then requested_locale else 'ar' end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_auth_user_created();

create or replace function public.bootstrap_first_school(
  p_school_name text,
  p_timezone text,
  p_admin_profile_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_school_id uuid;
  new_membership_id uuid;
  administrator_role_id uuid;
begin
  perform pg_advisory_xact_lock(127001, 1);

  if exists (select 1 from public.schools) then
    raise exception 'Initial school has already been created.' using errcode = 'P0001';
  end if;

  if length(trim(coalesce(p_school_name, ''))) = 0 then
    raise exception 'School name is required.' using errcode = '22023';
  end if;

  if length(trim(coalesce(p_timezone, ''))) = 0 then
    raise exception 'School timezone is required.' using errcode = '22023';
  end if;

  if not exists (select 1 from public.profiles where id = p_admin_profile_id) then
    raise exception 'Invited administrator profile was not created.' using errcode = '23503';
  end if;

  select id into administrator_role_id
  from public.roles
  where code = 'administrator';

  if administrator_role_id is null then
    raise exception 'Administrator role is not seeded.' using errcode = 'P0001';
  end if;

  insert into public.schools (name, timezone)
  values (trim(p_school_name), trim(p_timezone))
  returning id into new_school_id;

  insert into public.school_memberships (school_id, profile_id, status)
  values (new_school_id, p_admin_profile_id, 'active')
  returning id into new_membership_id;

  insert into public.membership_roles (membership_id, role_id)
  values (new_membership_id, administrator_role_id);

  insert into public.audit_logs (
    school_id, actor_profile_id, action, resource_type, resource_id, metadata
  ) values (
    new_school_id, p_admin_profile_id, 'school.bootstrap', 'school', new_school_id, '{}'::jsonb
  );

  return new_school_id;
end;
$$;

revoke all on function public.bootstrap_first_school (text, text, uuid)
from public, anon, authenticated;

grant
execute on function public.bootstrap_first_school (text, text, uuid) to service_role;