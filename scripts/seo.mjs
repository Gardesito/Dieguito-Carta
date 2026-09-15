import { readFile, writeFile } from 'node:fs/promises'
import { loadEnv } from 'vite'
const env=loadEnv('production',process.cwd(),'VITE_')
let base=''
if(env.VITE_SITE_URL){const url=new URL(env.VITE_SITE_URL);if(!['https:','http:'].includes(url.protocol))throw new Error('VITE_SITE_URL debe ser una URL HTTP(S).');base=url.origin}
const escape=value=>value.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;')
let html=await readFile('dist/index.html','utf8')
const tags=base?`<link rel="canonical" href="${escape(base)}/"/><meta property="og:url" content="${escape(base)}/"/><meta name="robots" content="index, follow"/>`:'<meta name="robots" content="noindex, nofollow"/>'
html=html.replace('</head>',`${tags}</head>`)
await writeFile('dist/index.html',html)
await writeFile('dist/robots.txt',base?`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /login\nSitemap: ${base}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n')
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${base?`<url><loc>${escape(base)}/</loc></url>`:''}</urlset>\n`)
console.log(base?`SEO generado para ${base}`:'SEO: demo sin indexación. Configurá VITE_SITE_URL al publicar.')
