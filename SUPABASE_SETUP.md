-- INSTRUCTIES VOOR DATABASE (SQL EDITOR):
-- 1. Ga naar je Supabase Dashboard
-- 2. Klik links op 'SQL Editor' (icoon >_)
-- 3. Klik op 'New Query'
-- 4. Kopieer onderstaande SQL code en plak het in het venster
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

-- UPDATE: Voeg foto kolom toe aan adviezen tabel (als je dit later toevoegt)
alter table advices add column if not exists photo_url text;

-- Tabel voor Burritos aanmaken
create table if not exists burritos (
  id uuid default gen_random_uuid() primary key,
  date_str text not null,
  formatted_date text not null,
  has_burritos boolean not null,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabel voor Foto's van Gerechten aanmaken
create table if not exists dish_photos (
  id uuid default gen_random_uuid() primary key,
  date_str text not null,
  dish_section text not null,
  photo_url text not null,
  uploader_name text not null,
  comment text,
  timestamp bigint not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Zet Realtime aan
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
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'dish_photos') then
    alter publication supabase_realtime add table dish_photos;
  end if;
end;
$$;


-- BELANGRIJKE EXTRA STAP VOOR FOTO OPSLAG (STORAGE):
-- Dit kan niet via SQL, dit moet je even aanklikken in het dashboard:
-- 1. Klik in het linker menu op 'Storage' (icoon van een emmer/bestanden).
-- 2. Klik op 'New Bucket'.
-- 3. Vul bij Name in: menu-photos
-- 4. Zet 'Public Bucket' AAN (vinkje zetten).
-- 5. Klik op 'Save'.
-- 6. Ga naar de nieuwe bucket 'menu-photos', klik op 'Configuration' (of Policies).
-- 7. Zorg dat iedereen mag uploaden en lezen (Public access). 
--    Als je policies moet instellen, kies "New Policy" -> "For full customization":
--    - Policy Name: "Public Access"
--    - Allowed operations: SELECT, INSERT (vink ze aan)
--    - Target roles: (laat leeg of selecteer anon)
--    - Klik Review en Save.