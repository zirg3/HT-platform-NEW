-- Ссылка на подключение к онлайн-уроку (Zoom, Телемост и т.д.)
alter table public.lessons
  add column if not exists meeting_url text;

comment on column public.lessons.meeting_url is 'URL или ссылка для подключения к уроку';
