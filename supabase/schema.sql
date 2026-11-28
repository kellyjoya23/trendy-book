-- Trendy Book · Base de datos de fichas de la cita (Blind date with a book)
-- Pega todo este archivo en Supabase > SQL Editor > New query y dale a "Run".
-- Se puede volver a ejecutar sin perder datos.

-- ============================================================
-- Fichas: una fila por cada formulario que llena una clienta
-- ============================================================
create table if not exists public.fichas (
  id              uuid primary key default gen_random_uuid(),
  creada          timestamptz not null default now(),
  actualizada     timestamptz not null default now(),
  codigo          text not null unique
                  check (codigo ~ '^TB-[A-Z0-9]{5}$'),        -- va en el WhatsApp para ubicar la ficha

  -- Lo que llena la clienta
  para            text not null check (para in ('regalo', 'mi')),
  nombre          text check (char_length(nombre) <= 80),       -- quien pide
  nombre_para     text check (char_length(nombre_para) <= 80),  -- quien recibe
  edad            text check (char_length(edad) <= 120),
  lee             text check (lee in ('avido', 'ocasional', 'casinolee', 'retomando')),
  idioma          text check (idioma in ('es', 'en', 'cualquiera')),
  gustos          text[] not null default '{}' check (cardinality(gustos) <= 12),
  evitar          text[] not null default '{}' check (cardinality(evitar) <= 12),
  evitar_otro     text check (char_length(evitar_otro) <= 300),
  ocasion         text check (char_length(ocasion) <= 120),
  notas           text check (char_length(notas) <= 2000),

  -- 02 · La cita
  fecha_deseada    date,
  lo_antes_posible boolean not null default false,
  dedicatoria      text check (char_length(dedicatoria) <= 300),   -- notita escrita a mano
  color            text check (char_length(color) <= 40),          -- color favorito, para los detalles

  -- 03 · Entrega y pago
  entrega         text check (entrega in ('punto', 'domicilio', 'envio')),
  punto           text check (char_length(punto) <= 80),             -- Metrocentro Sonsonate / CC El Encuentro
  direccion       text check (char_length(direccion) <= 300),
  pago            text check (pago in ('transferencia', 'contraentrega')),
  telefono        text check (char_length(telefono) <= 20),
  telefono_recibe text check (char_length(telefono_recibe) <= 20),   -- de quien recibe, si es regalo

  -- Lo que llena el equipo (CRM interno)
  estado          text not null default 'nueva'
                  check (estado in ('nueva', 'en_curaduria', 'confirmada', 'empacada', 'entregada', 'cancelada')),
  libro           text,
  notas_internas  text
);

-- Para bases creadas antes de agregar la cita y la entrega
alter table public.fichas
  add column if not exists fecha_deseada    date,
  add column if not exists lo_antes_posible boolean not null default false,
  add column if not exists dedicatoria      text check (char_length(dedicatoria) <= 300),
  add column if not exists entrega          text check (entrega in ('punto', 'domicilio', 'envio')),
  add column if not exists punto            text check (char_length(punto) <= 80),
  add column if not exists direccion        text check (char_length(direccion) <= 300),
  add column if not exists pago             text check (pago in ('transferencia', 'contraentrega')),
  add column if not exists telefono         text check (char_length(telefono) <= 20),
  add column if not exists idioma           text check (idioma in ('es', 'en', 'cualquiera')),
  add column if not exists color            text check (char_length(color) <= 40),
  add column if not exists telefono_recibe  text check (char_length(telefono_recibe) <= 20);

create index if not exists fichas_creada_idx on public.fichas (creada desc);
create index if not exists fichas_estado_idx on public.fichas (estado);

create or replace function public.marcar_actualizada()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.actualizada := now();
  return new;
end $$;

drop trigger if exists fichas_actualizada on public.fichas;
create trigger fichas_actualizada before update on public.fichas
  for each row execute function public.marcar_actualizada();

-- ============================================================
-- Seguridad
-- El formulario es público: cualquiera puede ENVIAR una ficha nueva,
-- pero nadie de afuera puede leer, cambiar ni borrar fichas.
-- Solo las cuentas marcadas como "equipo" (app_metadata.rol = 'equipo') ven los datos:
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || '{"rol":"equipo"}'
--   where email = 'correo@ejemplo.com';
-- ============================================================
alter table public.fichas enable row level security;

drop policy if exists "Clientas envian fichas"   on public.fichas;
drop policy if exists "Equipo ve fichas"         on public.fichas;
drop policy if exists "Equipo crea fichas"       on public.fichas;
drop policy if exists "Equipo edita fichas"      on public.fichas;
drop policy if exists "Equipo elimina fichas"    on public.fichas;

-- La clienta solo puede crear fichas nuevas, sin tocar los campos del equipo
create policy "Clientas envian fichas" on public.fichas for insert to anon
  with check (estado = 'nueva' and libro is null and notas_internas is null);

create policy "Equipo ve fichas" on public.fichas for select to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'equipo');
create policy "Equipo crea fichas" on public.fichas for insert to authenticated
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'equipo');
create policy "Equipo edita fichas" on public.fichas for update to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'equipo')
  with check (((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'equipo');
create policy "Equipo elimina fichas" on public.fichas for delete to authenticated
  using (((select auth.jwt()) -> 'app_metadata' ->> 'rol') = 'equipo');

-- Permisos de tabla: la clienta (anon) solo inserta
revoke all on public.fichas from anon;
grant insert on public.fichas to anon;
grant select, insert, update, delete on public.fichas to authenticated;
