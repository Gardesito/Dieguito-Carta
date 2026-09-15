begin;
create extension if not exists pgcrypto;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '', role text not null check(role in ('admin','editor')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.categories (
 id uuid primary key default gen_random_uuid(), name text not null check(length(trim(name))>0), slug text unique not null check(length(slug)>0),
 description text not null default '', image_url text not null default '', image_alt text not null default '', icon text not null default '',
 sort_order integer not null default 0, is_active boolean not null default true,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.products (
 id uuid primary key default gen_random_uuid(), category_id uuid not null references public.categories(id) on delete restrict,
 name text not null check(length(trim(name))>0), slug text unique not null check(length(slug)>0), description text not null default '', ingredients text not null default '',
 image_url text not null default '', image_alt text not null default '', price numeric(12,2) check(price>=0), small_price numeric(12,2) check(small_price>=0), large_price numeric(12,2) check(large_price>=0), price_label text not null default '',
 is_available boolean not null default true, is_featured boolean not null default false, is_visible boolean not null default true, sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.product_variants (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
 name text not null check(length(trim(name))>0), price numeric(12,2) not null check(price>=0), sort_order integer not null default 0, is_available boolean not null default true
);
create table public.promotions (
 id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete set null,
 title text not null check(length(trim(title))>0), description text not null default '', image_url text not null default '', image_alt text not null default '',
 previous_price numeric(12,2) check(previous_price>=0), current_price numeric(12,2) check(current_price>=0), starts_at timestamptz, ends_at timestamptz,
 is_active boolean not null default true, sort_order integer not null default 0,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(ends_at is null or starts_at is null or ends_at>starts_at)
);
create table public.site_content (
 id uuid primary key default gen_random_uuid(), content_key text unique not null check(content_key in ('hero','about')), title text not null default '', subtitle text not null default '', body text not null default '',
 image_url text not null default '', image_alt text not null default '', button_label text not null default '', button_url text not null default '',
 metadata jsonb not null default '{}'::jsonb check(jsonb_typeof(metadata)='object'), is_visible boolean not null default true, updated_at timestamptz not null default now()
);
create table public.site_settings (
 id uuid primary key default gen_random_uuid(), business_name text not null default 'Dieguito', whatsapp_number text not null default '', address text not null default '',
 maps_url text not null default '', instagram_url text not null default '', facebook_url text not null default '', opening_hours jsonb not null default '[]'::jsonb check(jsonb_typeof(opening_hours)='array'),
 logo_url text not null default '', logo_alt text not null default 'Dieguito', updated_at timestamptz not null default now()
);
create unique index site_settings_singleton on public.site_settings ((true));
create table public.media (
 id uuid primary key default gen_random_uuid(), file_name text not null, storage_path text unique not null, public_url text not null, alt_text text not null default '',
 mime_type text not null check(mime_type in ('image/jpeg','image/png','image/webp','image/avif')), size_bytes bigint not null check(size_bytes between 1 and 5242880), created_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_public_order_idx on public.products(sort_order) where is_visible;
create index categories_public_order_idx on public.categories(sort_order) where is_active;
create index variants_product_idx on public.product_variants(product_id,sort_order);
create index promotions_product_idx on public.promotions(product_id);
create index promotions_dates_idx on public.promotions(is_active,starts_at,ends_at);

create function public.set_updated_at() returns trigger language plpgsql set search_path='' as $$begin new.updated_at=now(); return new; end$$;
do $$declare t text;begin foreach t in array array['profiles','categories','products','promotions','site_content','site_settings'] loop execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',t);end loop;end$$;

-- SECURITY DEFINER avoids recursive profiles RLS. Fixed search_path; no caller-supplied identifiers.
create function public.is_staff() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and role in ('admin','editor'))$$;
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')$$;
revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.is_staff(),public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.promotions enable row level security;
alter table public.site_content enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;
create policy profiles_self_read on public.profiles for select to authenticated using(id=(select auth.uid()));
create policy profiles_admin on public.profiles for all to authenticated using((select public.is_admin())) with check((select public.is_admin()));
create policy categories_read on public.categories for select to anon,authenticated using(is_active);
create policy products_read on public.products for select to anon,authenticated using(is_visible and exists(select 1 from public.categories c where c.id=category_id and c.is_active));
create policy variants_read on public.product_variants for select to anon,authenticated using(exists(select 1 from public.products p join public.categories c on c.id=p.category_id where p.id=product_id and p.is_visible and c.is_active));
create policy promotions_read on public.promotions for select to anon,authenticated using(is_active and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now()));
create policy content_read on public.site_content for select to anon,authenticated using(is_visible);
create policy settings_read on public.site_settings for select to anon,authenticated using(true);
do $$declare t text;begin foreach t in array array['categories','products','product_variants','promotions','site_content','site_settings','media'] loop execute format('create policy staff_manage on public.%I for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()))',t);end loop;end$$;
grant select on public.categories,public.products,public.product_variants,public.promotions,public.site_content,public.site_settings to anon;
grant select,insert,update,delete on public.profiles,public.categories,public.products,public.product_variants,public.promotions,public.site_content,public.site_settings,public.media to authenticated;

-- Product and variants are saved in one transaction. INVOKER preserves RLS.
create function public.save_product(payload jsonb, variants jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
declare p public.products; v jsonb;
begin
 if not public.is_staff() then raise exception 'Not authorized' using errcode='42501'; end if;
 if jsonb_typeof(variants)<>'array' then raise exception 'Variants must be an array'; end if;
 p=jsonb_populate_record(null::public.products,payload);
 insert into public.products(id,category_id,name,slug,description,ingredients,image_url,image_alt,price,small_price,large_price,price_label,is_available,is_featured,is_visible,sort_order)
 values(p.id,p.category_id,p.name,p.slug,p.description,p.ingredients,p.image_url,p.image_alt,p.price,p.small_price,p.large_price,p.price_label,p.is_available,p.is_featured,p.is_visible,p.sort_order)
 on conflict(id) do update set category_id=excluded.category_id,name=excluded.name,slug=excluded.slug,description=excluded.description,ingredients=excluded.ingredients,image_url=excluded.image_url,image_alt=excluded.image_alt,price=excluded.price,small_price=excluded.small_price,large_price=excluded.large_price,price_label=excluded.price_label,is_available=excluded.is_available,is_featured=excluded.is_featured,is_visible=excluded.is_visible,sort_order=excluded.sort_order;
 delete from public.product_variants where product_id=p.id;
 for v in select * from jsonb_array_elements(variants) loop
 insert into public.product_variants(id,product_id,name,price,sort_order,is_available) values(coalesce((v->>'id')::uuid,gen_random_uuid()),p.id,v->>'name',(v->>'price')::numeric,coalesce((v->>'sort_order')::integer,0),coalesce((v->>'is_available')::boolean,true));
 end loop;
 return p.id;
end $$;
revoke all on function public.save_product(jsonb,jsonb) from public;
grant execute on function public.save_product(jsonb,jsonb) to authenticated;
create function public.reorder_items(table_name text, ordered_ids uuid[]) returns void language plpgsql security invoker set search_path='' as $$
begin
 if not public.is_staff() then raise exception 'Not authorized' using errcode='42501'; end if;
 if table_name not in ('products','categories') then raise exception 'Invalid table'; end if;
 execute format('update public.%I t set sort_order=x.position::integer from unnest($1) with ordinality x(id,position) where t.id=x.id',table_name) using ordered_ids;
end $$;
revoke all on function public.reorder_items(text,uuid[]) from public;
grant execute on function public.reorder_items(text,uuid[]) to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/jpeg','image/png','image/webp','image/avif']) on conflict(id) do update set public=true,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy images_read on storage.objects for select to anon,authenticated using(bucket_id='product-images');
-- Staff includes the editor role so content editors can replace photographs.
create policy images_insert on storage.objects for insert to authenticated with check(bucket_id='product-images' and (select public.is_staff()));
create policy images_update on storage.objects for update to authenticated using(bucket_id='product-images' and (select public.is_staff())) with check(bucket_id='product-images' and (select public.is_staff()));
create policy images_delete on storage.objects for delete to authenticated using(bucket_id='product-images' and (select public.is_staff()));
commit;
