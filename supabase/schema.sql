
-- EXO VET FIND
-- Database schema
-- 1차 제출용 데이터베이스 구조

-- 1. 병원 정보
create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  region text,
  district text,
  address text not null,
  phone text,
  website_url text,
  description text,
  verification_status text not null default '미확인'
    check (verification_status in ('미확인', '확인됨', '확인 필요')),
  source_url text,
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. 동물 종류
create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0
);

-- 3. 진료 항목
create table if not exists public.treatments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  sort_order integer not null default 0
);

-- 4. 병원별 진료 가능 동물
create table if not exists public.hospital_animals (
  hospital_id uuid not null
    references public.hospitals(id) on delete cascade,
  animal_id uuid not null
    references public.animals(id) on delete cascade,
  primary key (hospital_id, animal_id)
);

-- 5. 병원별 진료 항목
create table if not exists public.hospital_treatments (
  hospital_id uuid not null
    references public.hospitals(id) on delete cascade,
  treatment_id uuid not null
    references public.treatments(id) on delete cascade,
  primary key (hospital_id, treatment_id)
);

-- 6. 검색용 인덱스
create index if not exists idx_hospitals_region
  on public.hospitals(region);

create index if not exists idx_hospitals_district
  on public.hospitals(district);

create index if not exists idx_hospitals_name
  on public.hospitals(name);

create index if not exists idx_hospitals_verification
  on public.hospitals(verification_status);

-- 7. RLS 활성화
alter table public.hospitals enable row level security;
alter table public.animals enable row level security;
alter table public.treatments enable row level security;
alter table public.hospital_animals enable row level security;
alter table public.hospital_treatments enable row level security;

-- 8. 공개 조회 정책
drop policy if exists "Public can read hospitals"
  on public.hospitals;

drop policy if exists "Public can read animals"
  on public.animals;

drop policy if exists "Public can read treatments"
  on public.treatments;

drop policy if exists "Public can read hospital animals"
  on public.hospital_animals;

drop policy if exists "Public can read hospital treatments"
  on public.hospital_treatments;

create policy "Public can read hospitals"
  on public.hospitals for select
  to anon, authenticated using (true);

create policy "Public can read animals"
  on public.animals for select
  to anon, authenticated using (true);

create policy "Public can read treatments"
  on public.treatments for select
  to anon, authenticated using (true);

create policy "Public can read hospital animals"
  on public.hospital_animals for select
  to anon, authenticated using (true);

create policy "Public can read hospital treatments"
  on public.hospital_treatments for select
  to anon, authenticated using (true);

-- 9. 공개 조회 권한
grant select on
  public.hospitals,
  public.animals,
  public.treatments,
  public.hospital_animals,
  public.hospital_treatments
to anon, authenticated;
