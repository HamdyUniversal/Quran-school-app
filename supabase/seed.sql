insert into
    public.roles (code, name)
values (
        'administrator',
        'Administrator'
    ),
    ('teacher', 'Teacher'),
    ('student', 'Student') on conflict (code) do
update
set
    name = excluded.name;

insert into
    public.permissions (code, name)
values (
        'school.read',
        'Read school profile'
    ),
    (
        'school.people.manage',
        'Manage school people'
    ),
    (
        'school.settings.manage',
        'Manage school settings'
    ),
    (
        'profile.read.self',
        'Read own profile'
    ),
    (
        'audit.read',
        'Read school audit log'
    ) on conflict (code) do
update
set
    name = excluded.name;

insert into
    public.role_permissions (role_id, permission_id)
select role.id, permission.id
from public.roles as role
    cross join public.permissions as permission
where (
        role.code = 'administrator'
        and permission.code in (
            'school.read',
            'school.people.manage',
            'school.settings.manage',
            'profile.read.self',
            'audit.read'
        )
    )
    or (
        role.code = 'teacher'
        and permission.code in (
            'school.read',
            'profile.read.self'
        )
    )
    or (
        role.code = 'student'
        and permission.code in (
            'school.read',
            'profile.read.self'
        )
    ) on conflict do nothing;