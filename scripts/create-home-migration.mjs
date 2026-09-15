import { readFileSync, writeFileSync } from 'node:fs'
let sql = `begin;
do $$declare t text;begin foreach t in array array['products','product_variants','categories','promotions','site_content','site_settings'] loop execute format('alter table public.%I add column if not exists translations jsonb not null default ''{}''::jsonb check(jsonb_typeof(translations)=''object'')',t);end loop;end$$;
alter table public.promotions add column if not exists label text not null default 'OFERTA ESPECIAL';
alter table public.promotions add column if not exists button_label text not null default '';
alter table public.site_content drop constraint if exists site_content_content_key_check;
alter table public.site_content add constraint site_content_content_key_check check(content_key in ('hero','hero-grill','hero-sea','offer','about'));
`
const prior = readFileSync('supabase/migrations/002_variant_addons.sql', 'utf8')
let rpc = prior.slice(prior.indexOf('create or replace function'), prior.lastIndexOf('commit;'))
rpc = rpc
  .replace('is_visible,sort_order)', 'is_visible,sort_order,translations)')
  .replace(
    'p.is_visible,p.sort_order)',
    "p.is_visible,p.sort_order,coalesce(p.translations,'{}'::jsonb))",
  )
  .replace(
    'sort_order=excluded.sort_order;',
    'sort_order=excluded.sort_order,translations=excluded.translations;',
  )
  .replace('is_available,is_addon) values', 'is_available,is_addon,translations) values')
  .replace(
    "coalesce((v->>'is_addon')::boolean,false));",
    "coalesce((v->>'is_addon')::boolean,false),coalesce(v->'translations','{}'::jsonb));",
  )
sql += rpc + 'commit;\n' + readFileSync('supabase/seed-home.sql', 'utf8')
// Add initial translations without overwriting any already completed by the administrator.
const menu = readFileSync('src/data/menuData.ts', 'utf8')
const categories = JSON.parse(
  menu
    .split('export const menuCategories: Category[] = ')[1]
    .split('\nexport const menuProducts')[0],
)
const products = JSON.parse(menu.split('export const menuProducts: Product[] = ')[1])
const q = (v) => `'${JSON.stringify(v).replaceAll("'", "''")}'::jsonb`
sql += 'begin;\n'
for (const [table, rows] of [
  ['categories', categories],
  ['products', products],
])
  for (const row of rows)
    sql += `update public.${table} set translations=${q(row.translations)} where slug='${row.slug}' and translations='{}'::jsonb;\n`
// Offset categories once to keep their relative product order and order the initial featured trio.
sql += `update public.products p set sort_order=p.sort_order+case c.slug when 'pizzas' then 0 when 'hamburguesas-caseras' then 100 when 'empanadas' then 200 else 1000+c.sort_order*100 end from public.categories c where c.id=p.category_id and p.sort_order<100 and c.slug<>'pizzas';\ncommit;\n`
writeFileSync('supabase/migrations/003_home_i18n.sql', sql)
