-- Create table for romantic memories used by the homepage timeline/gallery.
create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  memory_date date not null,
  image_url text not null,
  created_at timestamp with time zone default now()
);

-- Optional: enable RLS and allow public read access for this gift website.
alter table public.memories enable row level security;

create policy "Public can read memories"
on public.memories
for select
to anon
using (true);

-- Optional starter rows
insert into public.memories (title, description, memory_date, image_url)
values
  (
    'Our First Hello',
    'The day our hearts met and everything changed.',
    '2023-02-14',
    'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1200&q=80'
  ),
  (
    'Coffee Date',
    'Butterflies, laughter, and unforgettable eye contact.',
    '2023-03-02',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80'
  );
