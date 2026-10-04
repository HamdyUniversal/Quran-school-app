create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

grant usage on schema private to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.schools (
    id uuid primary key default gen_random_uuid (),
    name text not null check (length(trim(name)) > 0),
    default_locale text not null default 'ar' check (
        default_locale in ('ar', 'en')
    ),
    timezone text not null,
    status text not null default 'active' check (
        status in ('active', 'inactive')
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (id, status)
);

create table public.profiles (
    id uuid primary key references auth.users (id) on delete restrict,
    display_name text not null check (
        length(trim(display_name)) > 0
    ),
    preferred_locale text not null default 'ar' check (
        preferred_locale in ('ar', 'en')
    ),
    status text not null default 'active' check (
        status in (
            'active',
            'inactive',
            'suspended'
        )
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table public.school_memberships (
    id uuid primary key default gen_random_uuid (),
    school_id uuid not null references public.schools (id) on delete restrict,
    profile_id uuid not null references public.profiles (id) on delete restrict,
    status text not null default 'invited' check (
        status in (
            'invited',
            'active',
            'suspended',
            'ended'
        )
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (school_id, profile_id),
    unique (school_id, id)
);

create table public.roles (
    id uuid primary key default gen_random_uuid (),
    code text not null unique check (length(trim(code)) > 0),
    name text not null check (length(trim(name)) > 0)
);

create table public.permissions (
    id uuid primary key default gen_random_uuid (),
    code text not null unique check (length(trim(code)) > 0),
    name text not null check (length(trim(name)) > 0)
);

create table public.role_permissions (
    role_id uuid not null references public.roles (id) on delete restrict,
    permission_id uuid not null references public.permissions (id) on delete restrict,
    primary key (role_id, permission_id)
);

create table public.membership_roles (
    membership_id uuid not null references public.school_memberships (id) on delete restrict,
    role_id uuid not null references public.roles (id) on delete restrict,
    primary key (membership_id, role_id)
);

create table public.teachers (
    id uuid primary key default gen_random_uuid (),
    school_id uuid not null references public.schools (id) on delete restrict,
    profile_id uuid not null,
    teacher_code text,
    status text not null default 'active' check (
        status in ('active', 'inactive')
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (school_id, profile_id),
    unique (school_id, id),
    foreign key (school_id, profile_id) references public.school_memberships (school_id, profile_id) on delete restrict
);

create table public.students (
    id uuid primary key default gen_random_uuid (),
    school_id uuid not null references public.schools (id) on delete restrict,
    profile_id uuid,
    display_name text not null check (
        length(trim(display_name)) > 0
    ),
    student_code text,
    date_of_birth date,
    level text,
    status text not null default 'active' check (
        status in (
            'active',
            'inactive',
            'withdrawn'
        )
    ),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (school_id, id),
    foreign key (school_id, profile_id) references public.school_memberships (school_id, profile_id) on delete restrict
);

create unique index students_school_profile_unique on public.students (school_id, profile_id)
where
    profile_id is not null;

create unique index students_school_code_unique on public.students (school_id, student_code)
where
    student_code is not null;

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete restrict,
  actor_profile_id uuid references public.profiles(id) on delete restrict,
  action text not null check (length(trim(action)) > 0),
  resource_type text not null check (length(trim(resource_type)) > 0),
  resource_id uuid,
  request_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index school_memberships_school_status_idx on public.school_memberships (school_id, status);

create index school_memberships_profile_status_idx on public.school_memberships (profile_id, status);

create index teachers_school_status_idx on public.teachers (school_id, status);

create unique index teachers_school_code_unique on public.teachers (school_id, teacher_code)
where
    teacher_code is not null;

create index students_school_status_idx on public.students (school_id, status);

create index audit_logs_school_created_idx on public.audit_logs (school_id, created_at desc);

create index audit_logs_actor_created_idx on public.audit_logs (
    actor_profile_id,
    created_at desc
);

create trigger schools_set_updated_at before update on public.schools
  for each row execute function private.set_updated_at();

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

create trigger school_memberships_set_updated_at before update on public.school_memberships
  for each row execute function private.set_updated_at();

create trigger teachers_set_updated_at before update on public.teachers
  for each row execute function private.set_updated_at();

create trigger students_set_updated_at before update on public.students
  for each row execute function private.set_updated_at();

create or replace function private.has_school_permission(target_school_id uuid, required_permission text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.school_memberships as membership
    join public.profiles as profile on profile.id = membership.profile_id
    join public.schools as school on school.id = membership.school_id
    join public.membership_roles as membership_role on membership_role.membership_id = membership.id
    join public.roles as role on role.id = membership_role.role_id
    join public.role_permissions as role_permission on role_permission.role_id = role.id
    join public.permissions as permission on permission.id = role_permission.permission_id
    where membership.profile_id = (select auth.uid())
      and membership.school_id = target_school_id
      and membership.status = 'active'
      and profile.status = 'active'
      and school.status = 'active'
      and permission.code = required_permission
  );
$$;

grant
execute on function private.has_school_permission (uuid, text) to authenticated;

alter table public.schools enable row level security;

alter table public.profiles enable row level security;

alter table public.school_memberships enable row level security;

alter table public.roles enable row level security;

alter table public.permissions enable row level security;

alter table public.role_permissions enable row level security;

alter table public.membership_roles enable row level security;

alter table public.teachers enable row level security;

alter table public.students enable row level security;

alter table public.audit_logs enable row level security;

create policy "users read permitted schools" on public.schools for
select to authenticated using (
        private.has_school_permission (id, 'school.read')
    );

create policy "users read own profile" on public.profiles for
select to authenticated using (
        id = (
            select auth.uid ()
        )
    );

create policy "admins read profiles in own school" on public.profiles for
select to authenticated using (
        exists (
            select 1
            from public.school_memberships as membership
            where
                membership.profile_id = profiles.id
                and private.has_school_permission (
                    membership.school_id, 'school.people.manage'
                )
        )
    );

create policy "users update own profile locale" on public.profiles for
update to authenticated using (
    id = (
        select auth.uid ()
    )
)
with
    check (
        id = (
            select auth.uid ()
        )
    );

create policy "users read own memberships" on public.school_memberships for
select to authenticated using (
        profile_id = (
            select auth.uid ()
        )
        or private.has_school_permission (
            school_id, 'school.people.manage'
        )
    );

create policy "authenticated users read role definitions" on public.roles for
select to authenticated using (true);

create policy "authenticated users read permission definitions" on public.permissions for
select to authenticated using (true);

create policy "authenticated users read role permission definitions" on public.role_permissions for
select to authenticated using (true);

create policy "users read own membership roles" on public.membership_roles for
select to authenticated using (
        exists (
            select 1
            from public.school_memberships as membership
            where
                membership.id = membership_roles.membership_id
                and (
                    membership.profile_id = (
                        select auth.uid ()
                    )
                    or private.has_school_permission (
                        membership.school_id, 'school.people.manage'
                    )
                )
        )
    );

create policy "admins and teachers read permitted teacher profiles" on public.teachers for
select to authenticated using (
        profile_id = (
            select auth.uid ()
        )
        or private.has_school_permission (
            school_id, 'school.people.manage'
        )
    );

create policy "admins and students read permitted student profiles" on public.students for
select to authenticated using (
        private.has_school_permission (
            school_id, 'school.people.manage'
        )
        or profile_id = (
            select auth.uid ()
        )
    );

create policy "admins read audit logs with explicit permission" on public.audit_logs for
select to authenticated using (
        school_id is not null
        and private.has_school_permission (school_id, 'audit.read')
    );

grant
select
    on public.schools,
    public.profiles,
    public.school_memberships,
    public.roles,
    public.permissions,
    public.role_permissions,
    public.membership_roles,
    public.teachers,
    public.students,
    public.audit_logs to authenticated;

grant update (preferred_locale) on public.profiles to authenticated;

revoke all on public.schools,
public.profiles,
public.school_memberships,
public.roles,
public.permissions,
public.role_permissions,
public.membership_roles,
public.teachers,
public.students,
public.audit_logs
from anon;