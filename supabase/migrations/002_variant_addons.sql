begin;
alter table public.product_variants add column if not exists is_addon boolean not null default false;
create or replace function public.save_product(payload jsonb, variants jsonb) returns uuid language plpgsql security invoker set search_path='' as $$
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
 insert into public.product_variants(id,product_id,name,price,sort_order,is_available,is_addon) values(coalesce((v->>'id')::uuid,gen_random_uuid()),p.id,v->>'name',(v->>'price')::numeric,coalesce((v->>'sort_order')::integer,0),coalesce((v->>'is_available')::boolean,true),coalesce((v->>'is_addon')::boolean,false));
 end loop;
 return p.id;
end $$;
revoke all on function public.save_product(jsonb,jsonb) from public;
grant execute on function public.save_product(jsonb,jsonb) to authenticated;
commit;
