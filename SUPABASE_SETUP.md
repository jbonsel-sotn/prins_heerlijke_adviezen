-- INSTRUCTIES:
-- 1. Ga naar je Supabase Dashboard
-- 2. Klik links op 'SQL Editor' (icoon >_)
-- 3. Klik op 'New Query'
-- 4. Kopieer ALLES in dit bestand en plak het in het venster
-- 5. Klik rechtsonder op 'Run'

-- Tabel voor Menu's aanmaken
create table if not exists menus (
  id uuid default gen_random_uuid() primary key,
  date_str text not null,
  formatted_date text not null,
  items text not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel voor Adviezen aanmaken
create table if not exists advices (
  id uuid default gen_random_uuid() primary key,
  date_str text not null,
  formatted_date text not null,
  advice text not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel voor Burritos aanmaken
create table if not exists burritos (
  id uuid default gen_random_uuid() primary key,
  date_str text not null,
  formatted_date text not null,
  has_burritos boolean not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zet Realtime aan voor deze tabellen (zodat de homepagina live update)
-- (Het kan zijn dat dit een foutmelding geeft als het al bestaat, dat is niet erg)
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'menus') then
    alter publication supabase_realtime add table menus;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'advices') then
    alter publication supabase_realtime add table advices;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'burritos') then
    alter publication supabase_realtime add table burritos;
  end if;
end;
$$;

-- Klaar! Je ziet 'Success' staan als het gelukt is.