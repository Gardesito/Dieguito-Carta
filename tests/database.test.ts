import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import { menuCategories, menuProducts } from '../src/data/menuData'
const admin = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  editor = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  visitor = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
let db: PGlite
async function as(role: string, id: string | null, sql: string) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${id || ''}',false);set role ${role};`,
  )
  try {
    return await db.query(sql)
  } finally {
    await db.exec('reset role')
  }
}
beforeAll(async () => {
  db = new PGlite()
  await db.exec(
    `create role anon;create role authenticated;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;grant usage on schema auth,public,storage to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;grant select,insert,update,delete on storage.objects to anon,authenticated;insert into auth.users values('${admin}'),('${editor}'),('${visitor}');`,
  )
  const migration = await readFile('supabase/migrations/001_initial_schema.sql', 'utf8')
  await db.exec(
    migration.replace(
      'create extension if not exists pgcrypto;',
      '-- gen_random_uuid is built into this test PostgreSQL runtime.',
    ),
  )
  await db.exec(await readFile('supabase/migrations/002_variant_addons.sql', 'utf8'))
  await db.exec(await readFile('supabase/migrations/003_home_i18n.sql', 'utf8'))
  await db.exec(await readFile('supabase/seed.sql', 'utf8'))
  await db.exec(
    `insert into public.profiles(id,role) values('${admin}','admin'),('${editor}','editor');`,
  )
})
afterAll(async () => {
  await db?.close()
})
describe('Esquema y políticas RLS (PostgreSQL local)', () => {
  it('guarda traducciones de producto y salsa con la función transaccional', async () => {
    const original = menuProducts.find((p) => p.name === 'Ñoquis')!
    const { product_variants, ...row } = original
    const payload = { ...row, translations: { en: { name: 'Gnocchi' }, pt: { name: 'Nhoque' } } }
    const variants = product_variants.map((v) => ({
      ...v,
      translations: { en: { name: v.name === 'Fileto' ? 'Tomato sauce' : v.name } },
    }))
    const q = (v: unknown) => JSON.stringify(v).replaceAll("'", "''")
    await as(
      'authenticated',
      editor,
      `select public.save_product('${q(payload)}'::jsonb,'${q(variants)}'::jsonb)`,
    )
    expect(
      (
        await db.query<{ translations: unknown }>(
          `select translations from public.products where id='${row.id}'`,
        )
      ).rows[0].translations,
    ).toEqual(payload.translations)
    expect(
      (
        await db.query<{ translations: unknown }>(
          `select translations from public.product_variants where id='${variants[0].id}'`,
        )
      ).rows[0].translations,
    ).toEqual({ en: { name: 'Tomato sauce' } })
    await db.exec(await readFile('supabase/seed-menu.sql', 'utf8'))
  })
  it('seed-menu y seed integrado coinciden exactamente con la carta local y son repetibles', async () => {
    const verify = async () => {
      const categories = await db.query('select * from public.categories order by sort_order')
      expect(categories.rows).toHaveLength(menuCategories.length)
      for (const c of menuCategories)
        expect(categories.rows.find((r) => r.slug === c.slug)).toMatchObject(c)
      const products = await db.query('select * from public.products')
      expect(products.rows).toHaveLength(menuProducts.length)
      for (const { product_variants, ...p } of menuProducts) {
        const row = products.rows.find((r) => r.slug === p.slug)!
        for (const key of ['price', 'small_price', 'large_price'])
          if (row[key] !== null) row[key] = Number(row[key])
        expect(row).toMatchObject(p)
        const variants = await db.query(
          `select * from public.product_variants where product_id='${p.id}' order by sort_order`,
        )
        expect(variants.rows.map((v) => ({ ...v, price: Number(v.price) }))).toEqual(
          product_variants,
        )
      }
    }
    await verify()
    await db.exec(await readFile('supabase/seed-menu.sql', 'utf8'))
    await db.exec(await readFile('supabase/seed-menu.sql', 'utf8'))
    await verify()
  })
  it('activa RLS en las ocho tablas', async () => {
    const r = await db.query<{ relrowsecurity: boolean }>(
      "select relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'",
    )
    expect(r.rows).toHaveLength(8)
    expect(r.rows.every((r) => r.relrowsecurity)).toBe(true)
  })
  it('permite leer el menú y prohíbe insertar como visitante', async () => {
    expect((await as('anon', null, 'select * from public.products')).rows).toHaveLength(184)
    await expect(
      as('anon', null, "insert into public.categories(name,slug) values('Intruso','intruso')"),
    ).rejects.toThrow()
  })
  it('no muestra productos ocultos ni categorías inactivas', async () => {
    await db.exec("update public.products set is_visible=false where name='Beagle'")
    expect(
      (await as('anon', null, "select * from public.products where name='Beagle'")).rows,
    ).toHaveLength(0)
    await db.exec(
      "update public.products set is_visible=true where name='Beagle';update public.categories set is_active=false where name='Pizzas'",
    )
    expect(
      (await as('anon', null, "select * from public.products where name='Muzzarella'")).rows,
    ).toHaveLength(0)
    await db.exec("update public.categories set is_active=true where name='Pizzas'")
  })
  it('permite administrar al editor y niega a un usuario sin perfil', async () => {
    await as(
      'authenticated',
      editor,
      "insert into public.categories(name,slug) values('Prueba','prueba')",
    )
    await expect(
      as('authenticated', visitor, "insert into public.categories(name,slug) values('No','no')"),
    ).rejects.toThrow()
  })
  it('impide al editor asignarse el rol admin', async () => {
    await as(
      'authenticated',
      editor,
      `update public.profiles set role='admin' where id='${editor}'`,
    )
    const r = await db.query<{ role: string }>(
      `select role from public.profiles where id='${editor}'`,
    )
    expect(r.rows[0].role).toBe('editor')
    await expect(
      as(
        'authenticated',
        editor,
        `insert into public.profiles(id,role) values('${visitor}','admin')`,
      ),
    ).rejects.toThrow()
  })
  it('permite al admin gestionar perfiles', async () => {
    await as(
      'authenticated',
      admin,
      `insert into public.profiles(id,role) values('${visitor}','editor')`,
    )
    await as('authenticated', admin, `delete from public.profiles where id='${visitor}'`)
  })
  it('oculta promociones vencidas, futuras e inactivas', async () => {
    await db.exec(
      "insert into public.promotions(title,ends_at) values('Vencida',now()-interval '1 day');insert into public.promotions(title,starts_at) values('Futura',now()+interval '1 day');insert into public.promotions(title,is_active) values('Inactiva',false)",
    )
    expect((await as('anon', null, 'select * from public.promotions')).rows).toHaveLength(0)
  })
  it('protege Storage contra escritura pública y permite al equipo', async () => {
    await expect(
      as(
        'anon',
        null,
        "insert into storage.objects(bucket_id,name) values('product-images','bad')",
      ),
    ).rejects.toThrow()
    await as(
      'authenticated',
      editor,
      "insert into storage.objects(bucket_id,name) values('product-images','staff')",
    )
    await expect(
      as(
        'authenticated',
        visitor,
        "insert into storage.objects(bucket_id,name) values('product-images','outsider')",
      ),
    ).rejects.toThrow()
    await expect(
      as(
        'authenticated',
        editor,
        "insert into storage.objects(bucket_id,name) values('other-bucket','bad')",
      ),
    ).rejects.toThrow()
  })
  it('configura formatos y límite del bucket', async () => {
    const r = await db.query<{ file_size_limit: number; allowed_mime_types: string[] }>(
      'select * from storage.buckets',
    )
    expect(Number(r.rows[0].file_size_limit)).toBe(5242880)
    expect(r.rows[0].allowed_mime_types).toEqual([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/avif',
    ])
  })
  it('revierte producto y variantes si alguna variante es inválida', async () => {
    const { rows } = await db.query<{ id: string; name: string } & Record<string, unknown>>(
      "select * from public.products where name='Muzzarella'",
    )
    const p = rows[0]
    const payload = JSON.stringify({ ...p, name: 'Cambio que debe revertirse' }).replaceAll(
      "'",
      "''",
    )
    await expect(
      as(
        'authenticated',
        editor,
        `select public.save_product('${payload}'::jsonb,'[{"name":"Inválida","price":-1}]'::jsonb)`,
      ),
    ).rejects.toThrow()
    const r = await db.query<{ name: string }>(
      `select name from public.products where id='${p.id}'`,
    )
    expect(r.rows[0].name).toBe('Muzzarella')
  })
  it('reordena con autorización y evita tablas no permitidas', async () => {
    await as(
      'authenticated',
      editor,
      "select public.reorder_items('products',array['10000000-0000-4000-8000-000000000002'::uuid,'10000000-0000-4000-8000-000000000001'::uuid])",
    )
    await expect(
      as('authenticated', editor, "select public.reorder_items('profiles',array[]::uuid[])"),
    ).rejects.toThrow()
    await expect(
      as('anon', null, "select public.reorder_items('products',array[]::uuid[])"),
    ).rejects.toThrow()
  })
  it('impide borrar una categoría con productos', async () => {
    await expect(
      as('authenticated', editor, "delete from public.categories where name='Pizzas'"),
    ).rejects.toThrow()
  })
  it('seed es repetible sin duplicar art?culos', async () => {
    await db.exec(await readFile('supabase/seed.sql', 'utf8'))
    const r = await db.query('select * from public.products')
    expect(r.rows).toHaveLength(184)
  })
})
