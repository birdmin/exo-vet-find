
-- EXO VET FIND
-- Initial reference data
-- 병원별 실제 진료 여부와는 별개인 검색 분류 데이터

-- 1. 동물 종류
insert into public.animals (name, slug, sort_order)
values
  ('새', 'bird', 1),
  ('햄스터', 'hamster', 2),
  ('고슴도치', 'hedgehog', 3),
  ('토끼', 'rabbit', 4),
  ('파충류', 'reptile', 5)
on conflict (slug) do nothing;

-- 2. 진료 항목
insert into public.treatments (name, slug, sort_order)
values
  ('건강검진', 'health-checkup', 1),
  ('내과', 'internal-medicine', 2),
  ('외과', 'surgery', 3),
  ('치과', 'dentistry', 4),
  ('피부과', 'dermatology', 5),
  ('영상검사', 'imaging', 6),
  ('응급진료', 'emergency', 7)
on conflict (slug) do nothing;
