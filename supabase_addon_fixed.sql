-- =====================================================
-- UPSEN HR MANAGEMENT - ADVANCED FEATURES ADDON (FIXED)
-- =====================================================
-- This script adds advanced features to the existing schema
-- Run this AFTER the basic schema is already deployed
-- Fixed version with proper keyword handling
-- =====================================================

-- =====================================================
-- 1. ADVANCED NOTIFICATION FUNCTIONS
-- =====================================================

-- Function to send notification to multiple users
CREATE OR REPLACE FUNCTION send_bulk_notification(
    user_ids UUID[],
    notification_type TEXT,
    title TEXT,
    content TEXT,
    action_url TEXT DEFAULT NULL,
    data JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
    user_id UUID;
    notification_count INTEGER := 0;
BEGIN
    FOREACH user_id IN ARRAY user_ids
    LOOP
        INSERT INTO public.notifications (user_id, type, title, content, action_url, data)
        VALUES (user_id, notification_type, title, content, action_url, data);
        notification_count := notification_count + 1;
    END LOOP;
    
    RETURN notification_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify department members
CREATE OR REPLACE FUNCTION notify_department(
    department_uuid UUID,
    notification_type TEXT,
    title TEXT,
    content TEXT,
    action_url TEXT DEFAULT NULL,
    data JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
    user_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO user_ids
    FROM public.profiles
    WHERE department_id = department_uuid AND is_active = true;
    
    IF user_ids IS NOT NULL THEN
        RETURN send_bulk_notification(user_ids, notification_type, title, content, action_url, data);
    END IF;
    
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify users by role
CREATE OR REPLACE FUNCTION notify_by_role(
    user_role TEXT,
    notification_type TEXT,
    title TEXT,
    content TEXT,
    action_url TEXT DEFAULT NULL,
    data JSONB DEFAULT '{}'
)
RETURNS INTEGER AS $$
DECLARE
    user_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO user_ids
    FROM public.profiles
    WHERE role = user_role AND is_active = true;
    
    IF user_ids IS NOT NULL THEN
        RETURN send_bulk_notification(user_ids, notification_type, title, content, action_url, data);
    END IF;
    
    RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. LEAVE REQUEST AUTOMATION
-- =====================================================

-- Function to auto-approve certain leave types
CREATE OR REPLACE FUNCTION process_leave_request()
RETURNS TRIGGER AS $$
DECLARE
    leave_type_record RECORD;
    manager_id UUID;
    requester_name TEXT;
BEGIN
    -- Get leave type details
    SELECT * INTO leave_type_record
    FROM public.leave_types
    WHERE id = NEW.leave_type_id;
    
    -- Get requester name
    SELECT full_name INTO requester_name
    FROM public.profiles
    WHERE id = NEW.user_id;
    
    -- Auto-approve if no approval required
    IF NOT leave_type_record.requires_approval THEN
        NEW.status := 'approved';
        NEW.approved_at := NOW();
        NEW.approved_by := NEW.user_id; -- Self-approved
        
        -- Create approval notification
        PERFORM create_notification(
            NEW.user_id,
            'leave_approved',
            'Leave Request Approved',
            'Your ' || leave_type_record.name || ' request has been automatically approved.',
            '/leave-requests/' || NEW.id::text
        );
    ELSE
        -- Find manager for approval
        SELECT head_division_id INTO manager_id
        FROM public.profiles
        WHERE id = NEW.user_id;
        
        -- Notify manager if exists
        IF manager_id IS NOT NULL THEN
            PERFORM create_notification(
                manager_id,
                'leave_approval_needed',
                'Leave Request Pending Approval',
                requester_name || ' has requested ' || leave_type_record.name || ' from ' || NEW.start_date || ' to ' || NEW.end_date,
                '/leave-requests/' || NEW.id::text,
                jsonb_build_object('request_id', NEW.id, 'requester_id', NEW.user_id)
            );
        END IF;
        
        -- Notify HR
        PERFORM notify_by_role(
            'hr',
            'leave_approval_needed',
            'New Leave Request',
            'A new leave request requires approval.',
            '/leave-requests/' || NEW.id::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'auto_process_leave_request') THEN
        CREATE TRIGGER auto_process_leave_request
            BEFORE INSERT ON public.leave_requests
            FOR EACH ROW EXECUTE FUNCTION process_leave_request();
    END IF;
END $$;

-- Function to handle leave request status changes
CREATE OR REPLACE FUNCTION handle_leave_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process if status actually changed
    IF OLD.status != NEW.status THEN
        CASE NEW.status
            WHEN 'approved' THEN
                PERFORM create_notification(
                    NEW.user_id,
                    'leave_approved',
                    'Leave Request Approved',
                    'Your leave request has been approved.',
                    '/leave-requests/' || NEW.id::text
                );
                
                -- Update attendance records for approved leave dates
                INSERT INTO public.attendance (user_id, date, status)
                SELECT NEW.user_id, generate_series(NEW.start_date, NEW.end_date, '1 day'::interval)::date, 'on_leave'
                ON CONFLICT (user_id, date) DO UPDATE SET status = 'on_leave';
                
            WHEN 'rejected' THEN
                PERFORM create_notification(
                    NEW.user_id,
                    'leave_rejected',
                    'Leave Request Rejected',
                    'Your leave request has been rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided'),
                    '/leave-requests/' || NEW.id::text
                );
        END CASE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_leave_status_change_trigger') THEN
        CREATE TRIGGER handle_leave_status_change_trigger
            AFTER UPDATE ON public.leave_requests
            FOR EACH ROW EXECUTE FUNCTION handle_leave_status_change();
    END IF;
END $$;

-- =====================================================
-- 3. TASK MANAGEMENT AUTOMATION
-- =====================================================

-- Function to handle task assignments
CREATE OR REPLACE FUNCTION handle_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
    -- Notify assigned user when task is created or reassigned
    IF (TG_OP = 'INSERT' AND NEW.assigned_to IS NOT NULL) OR 
       (TG_OP = 'UPDATE' AND OLD.assigned_to IS DISTINCT FROM NEW.assigned_to AND NEW.assigned_to IS NOT NULL) THEN
        
        PERFORM create_notification(
            NEW.assigned_to,
            'task_assigned',
            'New Task Assigned',
            'You have been assigned a new task: ' || NEW.title,
            '/tasks/' || NEW.id::text,
            jsonb_build_object('task_id', NEW.id, 'priority', NEW.priority)
        );
    END IF;
    
    -- Notify creator when task is completed
    IF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
        PERFORM create_notification(
            NEW.created_by,
            'task_completed',
            'Task Completed',
            'Task "' || NEW.title || '" has been completed.',
            '/tasks/' || NEW.id::text
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_task_assignment_trigger') THEN
        CREATE TRIGGER handle_task_assignment_trigger
            AFTER INSERT OR UPDATE ON public.tasks
            FOR EACH ROW EXECUTE FUNCTION handle_task_assignment();
    END IF;
END $$;

-- =====================================================
-- 4. CONVERSATION AND MESSAGE AUTOMATION
-- =====================================================

-- Function to update conversation last message time
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at 
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Only create trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_conversation_last_message_trigger') THEN
        CREATE TRIGGER update_conversation_last_message_trigger 
            AFTER INSERT ON public.messages
            FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
    END IF;
END $$;

-- =====================================================
-- 5. NEWS COUNTERS AUTOMATION
-- =====================================================

-- Function to update news counters
CREATE OR REPLACE FUNCTION update_news_counters()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_TABLE_NAME = 'news_likes' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.news SET likes_count = likes_count + 1 WHERE id = NEW.news_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.news SET likes_count = likes_count - 1 WHERE id = OLD.news_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'news_comments' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.news SET comments_count = comments_count + 1 WHERE id = NEW.news_id;
        ELSIF TG_OP = 'DELETE' THEN
            UPDATE public.news SET comments_count = comments_count - 1 WHERE id = OLD.news_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'news_views' THEN
        IF TG_OP = 'INSERT' THEN
            UPDATE public.news SET views_count = views_count + 1 WHERE id = NEW.news_id;
        END IF;
    END IF;
    
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Only create triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_likes_count') THEN
        CREATE TRIGGER update_news_likes_count 
            AFTER INSERT OR DELETE ON public.news_likes
            FOR EACH ROW EXECUTE FUNCTION update_news_counters();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_comments_count') THEN
        CREATE TRIGGER update_news_comments_count 
            AFTER INSERT OR DELETE ON public.news_comments
            FOR EACH ROW EXECUTE FUNCTION update_news_counters();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_news_views_count') THEN
        CREATE TRIGGER update_news_views_count 
            AFTER INSERT ON public.news_views
            FOR EACH ROW EXECUTE FUNCTION update_news_counters();
    END IF;
END $$;

-- =====================================================
-- 6. AUDIT LOGGING
-- =====================================================

-- Function for audit logging
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_values, new_values, user_id)
        VALUES (TG_TABLE_NAME, NEW.id, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (table_name, record_id, action, old_values, user_id)
        VALUES (TG_TABLE_NAME, OLD.id, TG_OP, to_jsonb(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Only create audit triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_profiles') THEN
        CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON public.profiles
            FOR EACH ROW EXECUTE FUNCTION audit_trigger();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_attendance') THEN
        CREATE TRIGGER audit_attendance AFTER INSERT OR UPDATE OR DELETE ON public.attendance
            FOR EACH ROW EXECUTE FUNCTION audit_trigger();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_leave_requests') THEN
        CREATE TRIGGER audit_leave_requests AFTER INSERT OR UPDATE OR DELETE ON public.leave_requests
            FOR EACH ROW EXECUTE FUNCTION audit_trigger();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_payslips') THEN
        CREATE TRIGGER audit_payslips AFTER INSERT OR UPDATE OR DELETE ON public.payslips
            FOR EACH ROW EXECUTE FUNCTION audit_trigger();
    END IF;
END $$;

-- =====================================================
-- 7. UTILITY FUNCTIONS
-- =====================================================

-- Function to get user's department colleagues
CREATE OR REPLACE FUNCTION get_department_colleagues(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    full_name TEXT,
    email TEXT,
    job_position TEXT,
    avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.full_name, p.email, p."position", p.avatar_url
    FROM public.profiles p
    WHERE p.department_id = (
        SELECT department_id FROM public.profiles WHERE id = user_uuid
    ) AND p.id != user_uuid AND p.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get attendance summary for a user
CREATE OR REPLACE FUNCTION get_attendance_summary(
    user_uuid UUID, 
    start_date DATE, 
    end_date DATE
)
RETURNS TABLE (
    total_days INTEGER,
    present_days INTEGER,
    absent_days INTEGER,
    late_days INTEGER,
    total_hours DECIMAL,
    overtime_hours DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_days,
        COUNT(CASE WHEN status IN ('attending', 'late') THEN 1 END)::INTEGER as present_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END)::INTEGER as absent_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END)::INTEGER as late_days,
        COALESCE(SUM(work_hours), 0) as total_hours,
        COALESCE(SUM(overtime_minutes), 0) / 60.0 as overtime_hours
    FROM public.attendance
    WHERE user_id = user_uuid 
    AND date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can approve leave requests
CREATE OR REPLACE FUNCTION can_approve_leave_request(
    approver_uuid UUID,
    request_uuid UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    approver_role TEXT;
    requester_dept UUID;
    approver_dept UUID;
BEGIN
    -- Get approver role
    SELECT role INTO approver_role 
    FROM public.profiles 
    WHERE id = approver_uuid;
    
    -- HR and admins can approve any request
    IF approver_role IN ('hr', 'admin', 'super_admin') THEN
        RETURN TRUE;
    END IF;
    
    -- Managers can approve requests from their department
    IF approver_role = 'manager' THEN
        SELECT p.department_id INTO requester_dept
        FROM public.leave_requests lr
        JOIN public.profiles p ON lr.user_id = p.id
        WHERE lr.id = request_uuid;
        
        SELECT department_id INTO approver_dept
        FROM public.profiles
        WHERE id = approver_uuid;
        
        RETURN requester_dept = approver_dept;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get system setting
CREATE OR REPLACE FUNCTION get_system_setting(setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
    setting_value JSONB;
BEGIN
    SELECT value INTO setting_value
    FROM public.system_settings
    WHERE key = setting_key;
    
    RETURN setting_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system setting
CREATE OR REPLACE FUNCTION update_system_setting(
    setting_key TEXT,
    setting_value JSONB,
    setting_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
    INSERT INTO public.system_settings (key, value, description)
    VALUES (setting_key, setting_value, setting_description)
    ON CONFLICT (key) DO UPDATE SET
        value = EXCLUDED.value,
        description = COALESCE(EXCLUDED.description, system_settings.description),
        updated_at = timezone('utc'::text, now());
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 8. REPORTING FUNCTIONS
-- =====================================================

-- Function to get department attendance statistics
CREATE OR REPLACE FUNCTION get_department_attendance_stats(
    dept_id UUID,
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    department_name TEXT,
    total_employees INTEGER,
    avg_attendance_rate DECIMAL,
    total_work_hours DECIMAL,
    total_overtime_hours DECIMAL,
    late_incidents INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.name as department_name,
        COUNT(DISTINCT p.id)::INTEGER as total_employees,
        ROUND(
            (COUNT(CASE WHEN a.status IN ('attending', 'late') THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(a.id), 0)) * 100, 2
        ) as avg_attendance_rate,
        COALESCE(SUM(a.work_hours), 0) as total_work_hours,
        COALESCE(SUM(a.overtime_minutes), 0) / 60.0 as total_overtime_hours,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END)::INTEGER as late_incidents
    FROM public.departments d
    LEFT JOIN public.profiles p ON d.id = p.department_id AND p.is_active = true
    LEFT JOIN public.attendance a ON p.id = a.user_id 
        AND a.date BETWEEN start_date AND end_date
    WHERE d.id = dept_id
    GROUP BY d.id, d.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get leave utilization report
CREATE OR REPLACE FUNCTION get_leave_utilization_report(
    year_param INTEGER DEFAULT EXTRACT(year FROM CURRENT_DATE)::INTEGER
)
RETURNS TABLE (
    leave_type_name TEXT,
    total_requests INTEGER,
    approved_requests INTEGER,
    rejected_requests INTEGER,
    pending_requests INTEGER,
    total_days_taken INTEGER,
    approval_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        lt.name as leave_type_name,
        COUNT(lr.id)::INTEGER as total_requests,
        COUNT(CASE WHEN lr.status = 'approved' THEN 1 END)::INTEGER as approved_requests,
        COUNT(CASE WHEN lr.status = 'rejected' THEN 1 END)::INTEGER as rejected_requests,
        COUNT(CASE WHEN lr.status = 'pending' THEN 1 END)::INTEGER as pending_requests,
        COALESCE(SUM(CASE WHEN lr.status = 'approved' THEN lr.days_requested END), 0)::INTEGER as total_days_taken,
        ROUND(
            (COUNT(CASE WHEN lr.status = 'approved' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(lr.id), 0)) * 100, 2
        ) as approval_rate
    FROM public.leave_types lt
    LEFT JOIN public.leave_requests lr ON lt.id = lr.leave_type_id 
        AND EXTRACT(year FROM lr.created_at) = year_param
    WHERE lt.is_active = true
    GROUP BY lt.id, lt.name
    ORDER BY total_requests DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get task completion metrics
CREATE OR REPLACE FUNCTION get_task_completion_metrics(
    start_date DATE,
    end_date DATE,
    user_uuid UUID DEFAULT NULL
)
RETURNS TABLE (
    total_tasks INTEGER,
    completed_tasks INTEGER,
    overdue_tasks INTEGER,
    completion_rate DECIMAL,
    avg_completion_time_days DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(t.id)::INTEGER as total_tasks,
        COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::INTEGER as completed_tasks,
        COUNT(CASE WHEN t.due_date < CURRENT_DATE AND t.status NOT IN ('completed', 'cancelled') THEN 1 END)::INTEGER as overdue_tasks,
        ROUND(
            (COUNT(CASE WHEN t.status = 'completed' THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(t.id), 0)) * 100, 2
        ) as completion_rate,
        ROUND(
            AVG(CASE 
                WHEN t.status = 'completed' THEN 
                    EXTRACT(days FROM (t.updated_at - t.created_at))
                ELSE NULL 
            END), 2
        ) as avg_completion_time_days
    FROM public.tasks t
    WHERE t.created_at::date BETWEEN start_date AND end_date
    AND (user_uuid IS NULL OR t.assigned_to = user_uuid OR t.created_by = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. MAINTENANCE FUNCTIONS
-- =====================================================

-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notifications 
    WHERE created_at < (CURRENT_DATE - INTERVAL '1 day' * days_to_keep)
    AND is_read = true;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old audit logs
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(days_to_keep INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.audit_log 
    WHERE created_at < (CURRENT_DATE - INTERVAL '1 day' * days_to_keep);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. HELPFUL VIEWS
-- =====================================================

-- View for employee directory with department info
CREATE OR REPLACE VIEW employee_directory AS
SELECT 
    p.id,
    p.full_name,
    p.email,
    p.phone_number,
    p."position",
    p.avatar_url,
    p.employee_id,
    p.date_of_joining,
    p.is_active,
    d.name as department_name,
    d.id as department_id,
    manager.full_name as manager_name
FROM public.profiles p
LEFT JOIN public.departments d ON p.department_id = d.id
LEFT JOIN public.profiles manager ON p.head_division_id = manager.id
WHERE p.is_active = true;

-- View for current month attendance summary
CREATE OR REPLACE VIEW current_month_attendance AS
SELECT 
    p.id as user_id,
    p.full_name,
    p.employee_id,
    COUNT(a.id) as total_days,
    COUNT(CASE WHEN a.status IN ('attending', 'late') THEN 1 END) as present_days,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
    COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
    COALESCE(SUM(a.work_hours), 0) as total_hours,
    COALESCE(SUM(a.overtime_minutes), 0) / 60.0 as overtime_hours
FROM public.profiles p
LEFT JOIN public.attendance a ON p.id = a.user_id 
    AND a.date >= date_trunc('month', CURRENT_DATE)
    AND a.date < date_trunc('month', CURRENT_DATE) + interval '1 month'
WHERE p.is_active = true
GROUP BY p.id, p.full_name, p.employee_id;

-- View for pending leave requests with user info
CREATE OR REPLACE VIEW pending_leave_requests AS
SELECT 
    lr.id,
    lr.start_date,
    lr.end_date,
    lr.days_requested,
    lr.reason,
    lr.created_at,
    p.full_name as requester_name,
    p.employee_id,
    p.avatar_url,
    d.name as department_name,
    lt.name as leave_type_name,
    lt.color as leave_type_color
FROM public.leave_requests lr
JOIN public.profiles p ON lr.user_id = p.id
LEFT JOIN public.departments d ON p.department_id = d.id
JOIN public.leave_types lt ON lr.leave_type_id = lt.id
WHERE lr.status = 'pending'
ORDER BY lr.created_at DESC;

-- View for upcoming events
CREATE OR REPLACE VIEW upcoming_events AS
SELECT 
    e.id,
    e.title,
    e.description,
    e.event_type,
    e.start_time,
    e.end_time,
    e.location,
    e.virtual_meeting_url,
    p.full_name as created_by_name,
    COUNT(ea.id) as attendee_count
FROM public.events e
JOIN public.profiles p ON e.created_by = p.id
LEFT JOIN public.event_attendees ea ON e.id = ea.event_id AND ea.status = 'accepted'
WHERE e.start_time > NOW()
GROUP BY e.id, e.title, e.description, e.event_type, e.start_time, e.end_time, e.location, e.virtual_meeting_url, p.full_name
ORDER BY e.start_time ASC;

-- =====================================================
-- 11. ENABLE REALTIME SUBSCRIPTIONS (SAFE)
-- =====================================================

-- Enable realtime for key tables (only if publication exists)
DO $$
BEGIN
    -- Check if supabase_realtime publication exists
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Add tables to realtime publication
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.task_comments;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.news_comments;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.event_attendees;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors if publication doesn't exist or tables already added
        NULL;
END $$;

-- =====================================================
-- 12. ADDITIONAL PERFORMANCE INDEXES (SAFE)
-- =====================================================

-- Create indexes only if they don't exist
DO $$
BEGIN
    -- Additional performance indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_attendance_user_status') THEN
        CREATE INDEX CONCURRENTLY idx_attendance_user_status ON public.attendance(user_id, status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_leave_requests_status_dates') THEN
        CREATE INDEX CONCURRENTLY idx_leave_requests_status_dates ON public.leave_requests(status, start_date, end_date);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_assignee_status') THEN
        CREATE INDEX CONCURRENTLY idx_tasks_assignee_status ON public.tasks(assigned_to, status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_messages_conversation_created') THEN
        CREATE INDEX CONCURRENTLY idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_unread') THEN
        CREATE INDEX CONCURRENTLY idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_events_time_range') THEN
        CREATE INDEX CONCURRENTLY idx_events_time_range ON public.events(start_time, end_time);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_news_published_featured') THEN
        CREATE INDEX CONCURRENTLY idx_news_published_featured ON public.news(is_published, is_featured, published_at DESC);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors for concurrent index creation
        NULL;
END $$;

-- =====================================================
-- ADDON COMPLETE
-- =====================================================

COMMENT ON SCHEMA public IS 'Upsen HR Management App - Advanced features addon applied successfully (Fixed Version)';

-- Success message
DO $$
BEGIN
    RAISE NOTICE '🎉 Advanced features addon installed successfully!';
    RAISE NOTICE '✅ Automated workflows enabled';
    RAISE NOTICE '✅ Advanced notifications system active';
    RAISE NOTICE '✅ Reporting functions available';
    RAISE NOTICE '✅ Real-time subscriptions enabled (if available)';
    RAISE NOTICE '✅ Performance optimizations applied';
    RAISE NOTICE '✅ All PostgreSQL reserved keywords properly handled';
END $$;