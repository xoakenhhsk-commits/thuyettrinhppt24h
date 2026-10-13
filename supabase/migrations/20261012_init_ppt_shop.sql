-- Migration: Initial Schema for PPT Shop
-- Date: 2026-10-12

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  zalo TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger to create profile when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, zalo, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'zalo', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_zalo TEXT NOT NULL,
  brief TEXT,
  input_file_path TEXT,
  plan TEXT NOT NULL CHECK (plan IN ('standard', 'rush')),
  amount INTEGER NOT NULL CHECK (amount > 0),
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (
    status IN ('pending_payment', 'paid', 'processing', 'completed', 'cancelled')
  ),
  due_at TIMESTAMPTZ,
  delivered_file_path TEXT,
  cancel_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(code);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Enable RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders Policies
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
CREATE POLICY "Users can view their own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert their own orders" ON public.orders;
CREATE POLICY "Users can insert their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'sepay',
  provider_txn_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL,
  raw_payload JSONB NOT NULL,
  matched BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_txn_id ON public.payments(provider_txn_id);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Payments Policies (Admin and service role only)
DROP POLICY IF EXISTS "Only admin can view payments" ON public.payments;
CREATE POLICY "Only admin can view payments"
  ON public.payments FOR SELECT
  USING (public.is_admin());


-- 4. ORDER_EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_order_id ON public.order_events(order_id);

-- Enable RLS for order_events
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Order Events Policies
DROP POLICY IF EXISTS "Users can view events for their own orders" ON public.order_events;
CREATE POLICY "Users can view events for their own orders"
  ON public.order_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_events.order_id
        AND (orders.user_id = auth.uid() OR public.is_admin())
    )
  );


-- 5. STORAGE BUCKETS SETUP
-- Private bucket for order input documents (docx, pdf, txt)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-inputs', 'order-inputs', false)
ON CONFLICT (id) DO NOTHING;

-- Private bucket for delivered PPT documents (pptx)
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-outputs', 'order-outputs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for order-inputs:
DROP POLICY IF EXISTS "Users can upload their own input files" ON storage.objects;
CREATE POLICY "Users can upload their own input files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-inputs'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users and admin can read input files" ON storage.objects;
CREATE POLICY "Users and admin can read input files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-inputs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );

-- Storage Policies for order-outputs:
DROP POLICY IF EXISTS "Only admin can upload to order-outputs" ON storage.objects;
CREATE POLICY "Only admin can upload to order-outputs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'order-outputs'
    AND public.is_admin()
  );

DROP POLICY IF EXISTS "Users and admin can read outputs" ON storage.objects;
CREATE POLICY "Users and admin can read outputs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'order-outputs'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.is_admin()
    )
  );
