-- =====================================================
-- UPSEN HR MANAGEMENT APP - FIXED SUPABASE SQL SCHEMA
-- =====================================================
-- This is the corrected version that fixes column reference issues
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CORE TABLES (Fixed Order)
-- =====================================================

-- Departments table (create first due to foreign key dependencies)
CREATE TABLE public.departments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    head_id UUID, -- Will reference profiles after it's created
    parent_id UUID REFERENCES public.departments(id),
    budget DECIMAL(12,2),
    location TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    country_code TEXT DEFAULT '+1',
    avatar_url TEXT,
    position TEXT,
    department_id UUID REFERENCES public.departments(id),
    employee_id TEXT UNIQUE,
    date_of_joining DATE,
    date_of_birth DATE,
    date_applied DATE DEFAULT CURRENT_DATE,
    head_division_id UUID, -- Self-reference for manager
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'United States',
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    salary DECIMAL(10,2),
    hourly_rate DECIMAL(8,2),
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'manager', 'hr', 'admin', 'super_admin')),
    employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'intern')),
    work_schedule JSONB DEFAULT '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
    timezone TEXT DEFAULT 'America/New_York',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Add foreign key constraints after both tables exist
ALTER TABLE public.departments ADD CONSTRAINT fk_departments_head 
    FOREIGN KEY (head_id) REFERENCES public.profiles(id);

ALTER TABLE public.profiles ADD CONSTRAINT fk_profiles_manager 
    FOREIGN KEY (head_division_id) REFERENCES public.profiles(id);

-- Leave types configuration (create before leave_requests)
CREATE TABLE public.leave_types (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    max_days_per_year INTEGER,
    requires_approval BOOLEAN DEFAULT true,
    requires_document BOOLEAN DEFAULT false,
    color TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Insert default leave types
INSERT INTO public.leave_types (name, description, max_days_per_year, requires_approval, requires_document, color) VALUES
('Annual Leave', 'Yearly vacation days', 25, true, false, '#10B981'),
('Sick Leave', 'Medical leave', 10, false, true, '#EF4444'),
('Casual Leave', 'Personal time off', 12, true, false, '#3B82F6'),
('Maternity Leave', 'Maternity leave', 90, true, true, '#EC4899'),
('Paternity Leave', 'Paternity leave', 15, true, true, '#8B5CF6'),
('Emergency Leave', 'Emergency situations', 5, false, false, '#F59E0B'),
('Unpaid Leave', 'Leave without pay', null, true, false, '#6B7280');

-- Attendance tracking
CREATE TABLE public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'attending' CHECK (status IN ('attending', 'late', 'absent', 'on_leave', 'sick_leave', 'holiday', 'remote')),
    work_hours DECIMAL(4,2),
    overtime_minutes INTEGER DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,
    location_in TEXT,
    location_out TEXT,
    ip_address_in INET,
    ip_address_out INET,
    device_info JSONB,
    notes TEXT,
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, date)
);

-- Leave requests
CREATE TABLE public.leave_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    leave_type_id UUID REFERENCES public.leave_types(id) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    document_url TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled', 'withdrawn')),
    approved_by UUID REFERENCES public.profiles(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    emergency_contact_notified BOOLEAN DEFAULT false,
    handover_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Projects
CREATE TABLE public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    client_name TEXT,
    project_manager_id UUID REFERENCES public.profiles(id),
    department_id UUID REFERENCES public.departments(id),
    start_date DATE,
    end_date DATE,
    budget DECIMAL(12,2),
    status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Tasks
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    project_id UUID REFERENCES public.projects(id),
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    assigned_to UUID REFERENCES public.profiles(id),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    due_date DATE,
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'completed', 'cancelled')),
    completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    tags TEXT[],
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Task members (many-to-many relationship)
CREATE TABLE public.task_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('member', 'reviewer', 'observer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(task_id, user_id)
);

-- Task comments
CREATE TABLE public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Conversations for chat
CREATE TABLE public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'channel')),
    name TEXT,
    description TEXT,
    avatar_url TEXT,
    created_by UUID REFERENCES public.profiles(id),
    is_archived BOOLEAN DEFAULT false,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Conversation members
CREATE TABLE public.conversation_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
    last_read_at TIMESTAMP WITH TIME ZONE,
    notifications_enabled BOOLEAN DEFAULT true,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(conversation_id, user_id)
);

-- Messages
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'voice', 'video', 'location', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type TEXT,
    reply_to_id UUID REFERENCES public.messages(id),
    edited_at TIMESTAMP WITH TIME ZONE,
    is_deleted BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Message reactions
CREATE TABLE public.message_reactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    emoji TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(message_id, user_id, emoji)
);

-- Events
CREATE TABLE public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'training', 'holiday', 'company_event', 'birthday', 'anniversary')),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    virtual_meeting_url TEXT,
    attendees_scope TEXT DEFAULT 'custom' CHECK (attendees_scope IN ('all', 'department', 'custom')),
    department_id UUID REFERENCES public.departments(id),
    is_all_day BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB,
    reminder_minutes INTEGER[] DEFAULT '{15, 60}',
    max_attendees INTEGER,
    requires_rsvp BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.profiles(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Event attendees
CREATE TABLE public.event_attendees (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'maybe', 'no_response')),
    response_notes TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(event_id, user_id)
);

-- Payslips
CREATE TABLE public.payslips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    pay_date DATE NOT NULL,
    gross_pay DECIMAL(10,2) NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    overtime_pay DECIMAL(10,2) DEFAULT 0,
    bonus DECIMAL(10,2) DEFAULT 0,
    allowances DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) NOT NULL,
    tax_deduction DECIMAL(10,2) DEFAULT 0,
    social_security DECIMAL(10,2) DEFAULT 0,
    health_insurance DECIMAL(10,2) DEFAULT 0,
    retirement_contribution DECIMAL(10,2) DEFAULT 0,
    other_deductions DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) NOT NULL,
    net_pay DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    tax_code TEXT,
    pay_frequency TEXT DEFAULT 'monthly' CHECK (pay_frequency IN ('weekly', 'bi_weekly', 'monthly', 'quarterly')),
    details JSONB DEFAULT '{}',
    pdf_url TEXT,
    is_finalized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, pay_period_start, pay_period_end)
);

-- Payment cards
CREATE TABLE public.payment_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    card_number_encrypted TEXT NOT NULL, -- Store encrypted
    card_number_last4 TEXT NOT NULL, -- Store last 4 digits for display
    card_holder_name TEXT NOT NULL,
    expiry_month INTEGER NOT NULL CHECK (expiry_month >= 1 AND expiry_month <= 12),
    expiry_year INTEGER NOT NULL,
    card_type TEXT DEFAULT 'visa' CHECK (card_type IN ('visa', 'mastercard', 'amex', 'discover')),
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    billing_address JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- News/Announcements
CREATE TABLE public.news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    image_url TEXT,
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'hr', 'it', 'finance', 'events', 'policy')),
    author_id UUID REFERENCES public.profiles(id) NOT NULL,
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    is_urgent BOOLEAN DEFAULT false,
    target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'department', 'role', 'custom')),
    target_departments UUID[],
    target_roles TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- News comments
CREATE TABLE public.news_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID REFERENCES public.news(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.news_comments(id), -- For nested comments
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- News likes
CREATE TABLE public.news_likes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID REFERENCES public.news(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(news_id, user_id)
);

-- News views tracking
CREATE TABLE public.news_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID REFERENCES public.news(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(news_id, user_id)
);

-- Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('leave_approved', 'leave_rejected', 'task_assigned', 'task_completed', 'message', 'event_reminder', 'clock_in_reminder', 'payslip_ready', 'news_published', 'birthday_reminder', 'system_maintenance')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    action_url TEXT,
    data JSONB DEFAULT '{}',
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notification settings
CREATE TABLE public.notification_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT true,
    push_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    leave_notifications BOOLEAN DEFAULT true,
    task_notifications BOOLEAN DEFAULT true,
    message_notifications BOOLEAN DEFAULT true,
    event_notifications BOOLEAN DEFAULT true,
    news_notifications BOOLEAN DEFAULT true,
    reminder_notifications BOOLEAN DEFAULT true,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    timezone TEXT DEFAULT 'America/New_York',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Notes
CREATE TABLE public.notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    color TEXT DEFAULT '#FBBF24',
    reminder_time TIMESTAMP WITH TIME ZONE,
    is_shared BOOLEAN DEFAULT false,
    shared_with UUID[],
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Company information
CREATE TABLE public.company_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    legal_name TEXT,
    logo_url TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT,
    tax_id TEXT,
    registration_number TEXT,
    ceo_name TEXT,
    founded_date DATE,
    employee_count INTEGER,
    headquarters TEXT,
    sector TEXT,
    industry TEXT,
    description TEXT,
    mission_statement TEXT,
    vision_statement TEXT,
    values TEXT[],
    social_media JSONB DEFAULT '{}',
    business_hours JSONB DEFAULT '{}',
    holidays JSONB DEFAULT '[]',
    policies JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Audit log for tracking changes
CREATE TABLE public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES public.profiles(id),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- File uploads tracking
CREATE TABLE public.file_uploads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    mime_type TEXT,
    bucket_name TEXT NOT NULL,
    is_public BOOLEAN DEFAULT false,
    related_table TEXT,
    related_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- System settings table for app configuration
CREATE TABLE public.system_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- 2. BASIC FUNCTIONS (Create before triggers)
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to calculate work hours
CREATE OR REPLACE FUNCTION calculate_work_hours()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
        NEW.work_hours = EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600.0;
        
        -- Subtract break time if exists
        IF NEW.break_start IS NOT NULL AND NEW.break_end IS NOT NULL THEN
            NEW.break_minutes = EXTRACT(EPOCH FROM (NEW.break_end - NEW.break_start)) / 60.0;
            NEW.work_hours = NEW.work_hours - (NEW.break_minutes / 60.0);
        END IF;
        
        -- Calculate overtime (assuming 8 hours is standard)
        IF NEW.work_hours > 8 THEN
            NEW.overtime_minutes = (NEW.work_hours - 8) * 60;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    user_uuid UUID,
    notification_type TEXT,
    title TEXT,
    content TEXT,
    action_url TEXT DEFAULT NULL,
    data JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, type, title, content, action_url, data)
    VALUES (user_uuid, notification_type, title, content, action_url, data)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. BASIC TRIGGERS
-- =====================================================

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payslips_updated_at BEFORE UPDATE ON public.payslips
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_cards_updated_at BEFORE UPDATE ON public.payment_cards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_info_updated_at BEFORE UPDATE ON public.company_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at BEFORE UPDATE ON public.notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER calculate_attendance_hours BEFORE INSERT OR UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION calculate_work_hours();

-- =====================================================
-- 4. INDEXES FOR PERFORMANCE
-- =====================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_employee_id ON public.profiles(employee_id);
CREATE INDEX idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_is_active ON public.profiles(is_active);

-- Attendance indexes
CREATE INDEX idx_attendance_user_date ON public.attendance(user_id, date);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_attendance_status ON public.attendance(status);

-- Leave requests indexes
CREATE INDEX idx_leave_requests_user_id ON public.leave_requests(user_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON public.leave_requests(start_date, end_date);

-- Tasks indexes
CREATE INDEX idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);

-- Messages indexes
CREATE INDEX idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

-- Events indexes
CREATE INDEX idx_events_start_time ON public.events(start_time);
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_created_by ON public.events(created_by);

-- News indexes
CREATE INDEX idx_news_published_at ON public.news(published_at);
CREATE INDEX idx_news_category ON public.news(category);
CREATE INDEX idx_news_is_published ON public.news(is_published);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at);

-- =====================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Departments policies
CREATE POLICY "Departments are viewable by authenticated users" ON public.departments
    FOR SELECT TO authenticated USING (true);

-- Leave types policies
CREATE POLICY "Leave types are viewable by authenticated users" ON public.leave_types
    FOR SELECT TO authenticated USING (is_active = true);

-- Attendance policies
CREATE POLICY "Users can view own attendance" ON public.attendance
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'hr', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Users can create own attendance" ON public.attendance
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attendance" ON public.attendance
    FOR UPDATE TO authenticated USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'hr', 'admin', 'super_admin')
        )
    );

-- Leave requests policies
CREATE POLICY "Users can view relevant leave requests" ON public.leave_requests
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'hr', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Users can create own leave requests" ON public.leave_requests
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own pending requests" ON public.leave_requests
    FOR UPDATE TO authenticated USING (
        (user_id = auth.uid() AND status = 'pending') OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'hr', 'admin', 'super_admin')
        )
    );

-- Tasks policies
CREATE POLICY "Users can view relevant tasks" ON public.tasks
    FOR SELECT TO authenticated USING (
        created_by = auth.uid() OR 
        assigned_to = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM public.task_members 
            WHERE task_id = tasks.id AND user_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('manager', 'hr', 'admin', 'super_admin')
        )
    );

CREATE POLICY "Users can create tasks" ON public.tasks
    FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
    FOR INSERT TO authenticated WITH CHECK (
        sender_id = auth.uid() AND 
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()
        )
    );

-- Conversations policies
CREATE POLICY "Users can view their conversations" ON public.conversations
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.conversation_members 
            WHERE conversation_id = conversations.id AND user_id = auth.uid()
        )
    );

-- Payslips policies
CREATE POLICY "Users can only view own payslips" ON public.payslips
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('hr', 'admin', 'super_admin')
        )
    );

-- Payment cards policies
CREATE POLICY "Users can only access own payment cards" ON public.payment_cards
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- News policies
CREATE POLICY "Users can view published news" ON public.news
    FOR SELECT TO authenticated USING (is_published = true);

-- Notifications policies
CREATE POLICY "Users can only access own notifications" ON public.notifications
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Notification settings policies
CREATE POLICY "Users can only access own notification settings" ON public.notification_settings
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Notes policies
CREATE POLICY "Users can access own notes and shared notes" ON public.notes
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR 
        (is_shared = true AND auth.uid() = ANY(shared_with))
    );

CREATE POLICY "Users can create own notes" ON public.notes
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notes" ON public.notes
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Company info policies
CREATE POLICY "Company info is viewable by authenticated users" ON public.company_info
    FOR SELECT TO authenticated USING (true);

-- System settings policies
CREATE POLICY "Public settings are viewable by authenticated users" ON public.system_settings
    FOR SELECT TO authenticated USING (is_public = true);

-- File uploads policies
CREATE POLICY "Users can view own files and public files" ON public.file_uploads
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR is_public = true
    );

CREATE POLICY "Users can upload own files" ON public.file_uploads
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. INSERT DEFAULT DATA
-- =====================================================

-- Insert default company info
INSERT INTO public.company_info (
    name, 
    legal_name, 
    description, 
    mission_statement, 
    vision_statement,
    values,
    business_hours,
    holidays
) VALUES (
    'Upsen Technologies',
    'Upsen Technologies Inc.',
    'A leading technology company focused on innovative HR solutions.',
    'To empower organizations with cutting-edge HR technology solutions.',
    'To be the global leader in HR technology innovation.',
    ARRAY['Innovation', 'Integrity', 'Excellence', 'Collaboration', 'Customer Focus'],
    '{"monday": {"start": "09:00", "end": "17:00"}, "tuesday": {"start": "09:00", "end": "17:00"}, "wednesday": {"start": "09:00", "end": "17:00"}, "thursday": {"start": "09:00", "end": "17:00"}, "friday": {"start": "09:00", "end": "17:00"}}',
    '[{"name": "New Year''s Day", "date": "2024-01-01"}, {"name": "Independence Day", "date": "2024-07-04"}, {"name": "Christmas Day", "date": "2024-12-25"}]'
);

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('app_version', '"1.0.0"', 'Current application version', true),
('maintenance_mode', 'false', 'Enable/disable maintenance mode', false),
('max_file_upload_size', '10485760', 'Maximum file upload size in bytes (10MB)', false),
('default_work_hours', '8', 'Default work hours per day', false),
('overtime_threshold', '8', 'Hours after which overtime is calculated', false),
('max_leave_days_per_request', '30', 'Maximum leave days in a single request', false),
('notification_retention_days', '90', 'Days to keep read notifications', false),
('birthday_reminder_enabled', 'true', 'Enable birthday reminders', false),
('anniversary_reminder_enabled', 'true', 'Enable work anniversary reminders', false),
('auto_clockout_time', '"17:00"', 'Time for automatic clock-out', false),
('clockin_reminder_time', '"09:30"', 'Time to send clock-in reminders', false);

-- =====================================================
-- 7. FINAL PERMISSIONS
-- =====================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Final comment
COMMENT ON SCHEMA public IS 'Upsen HR Management App - Fixed database schema v1.0 - Ready for production deployment';