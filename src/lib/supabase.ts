import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cocywsgybygqitlkxbfy.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNvY3l3c2d5YnlncWl0bGt4YmZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4ODE1MDcsImV4cCI6MjA3NjQ1NzUwN30.WdQjT2r3IXuV--PVd5dDgajGi3oauoLois6Oex8-sP0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      punch_in_records: {
        Row: {
          id: string
          user_id: string
          user_email: string
          name: string
          location: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          name: string
          location: string
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          name?: string
          location?: string
          timestamp?: string
          created_at?: string
        }
      }
      corrective_maintenance_records: {
        Row: {
          id: string
          user_id: string
          user_email: string
          location: string
          issue: string
          tt_number: string
          damage_reason: string
          restoration_possible_as_per_sla: boolean
          status: string
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          location: string
          issue: string
          tt_number: string
          damage_reason: string
          restoration_possible_as_per_sla?: boolean
          status?: string
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          location?: string
          issue?: string
          tt_number?: string
          damage_reason?: string
          restoration_possible_as_per_sla?: boolean
          status?: string
          timestamp?: string
          created_at?: string
        }
      }
      preventive_maintenance_records: {
        Row: {
          id: string
          user_id: string
          user_email: string
          mandal_name: string
          location: string
          ring_name: string
          no_of_gps: number
          otdr_testing_from_location: string
          otdr_testing_to_location: string
          gp_span_name: string
          fiber_tests: any
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          mandal_name: string
          location: string
          ring_name: string
          no_of_gps?: number
          otdr_testing_from_location: string
          otdr_testing_to_location: string
          gp_span_name: string
          fiber_tests?: any
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          mandal_name?: string
          location?: string
          ring_name?: string
          no_of_gps?: number
          otdr_testing_from_location?: string
          otdr_testing_to_location?: string
          gp_span_name?: string
          fiber_tests?: any
          timestamp?: string
          created_at?: string
        }
      }
      change_request_records: {
        Row: {
          id: string
          user_id: string
          user_email: string
          mandal_name: string
          ring_name: string
          gp_span_name: string
          change_request_no: string
          reason_for_activity: string
          material_consumed_ofc: number
          material_consumed_poles: number
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          mandal_name: string
          ring_name: string
          gp_span_name: string
          change_request_no: string
          reason_for_activity: string
          material_consumed_ofc?: number
          material_consumed_poles?: number
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          mandal_name?: string
          ring_name?: string
          gp_span_name?: string
          change_request_no?: string
          reason_for_activity?: string
          material_consumed_ofc?: number
          material_consumed_poles?: number
          timestamp?: string
          created_at?: string
        }
      }
      gp_live_check_records: {
        Row: {
          id: string
          user_id: string
          user_email: string
          mandal: string
          ring_name: string
          gp_name: string
          fdms_issue: boolean
          termination_issue: boolean
          re_location: boolean
          fiber_issue: boolean
          issue_details: string | null
          rack_installed: boolean
          router_issue: boolean
          sfp_module: boolean
          ups_issue: boolean
          mcb_issue: boolean
          trough_raw_power_router: boolean
          apsfl_power_meter_connection: boolean
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          mandal: string
          ring_name: string
          gp_name: string
          fdms_issue?: boolean
          termination_issue?: boolean
          re_location?: boolean
          fiber_issue?: boolean
          issue_details?: string | null
          rack_installed?: boolean
          router_issue?: boolean
          sfp_module?: boolean
          ups_issue?: boolean
          mcb_issue?: boolean
          trough_raw_power_router?: boolean
          apsfl_power_meter_connection?: boolean
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          mandal?: string
          ring_name?: string
          gp_name?: string
          fdms_issue?: boolean
          termination_issue?: boolean
          re_location?: boolean
          fiber_issue?: boolean
          issue_details?: string | null
          rack_installed?: boolean
          router_issue?: boolean
          sfp_module?: boolean
          ups_issue?: boolean
          mcb_issue?: boolean
          trough_raw_power_router?: boolean
          apsfl_power_meter_connection?: boolean
          timestamp?: string
          created_at?: string
        }
      }
      patroller_task_records: {
        Row: {
          id: string
          user_id: string
          user_email: string
          mandal_name: string
          location: string
          ring_name: string
          no_of_gps: number
          gp_span_name: string
          sag_location_identified: boolean
          sag_location_photos: any
          clamp_damaged: boolean
          clamp_damage_photos: any
          tension_clamp_count: number
          suspension_clamp_count: number
          new_pole_bend_identified: boolean
          pole_damage: boolean
          pole_damage_photos: any
          pole_bend_new_poles: boolean
          pole_bend_photos: any
          loop_stand_issues: boolean
          loop_stand_photos: any
          tree_cutting_activity: boolean
          tree_cutting_photos: any
          joint_enclosure_problems: boolean
          joint_enclosure_photos: any
          cut_location_identified: boolean
          cut_location_photos: any
          other_activities_description: string | null
          other_activities_photos: any
          timestamp: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          user_email: string
          mandal_name: string
          location: string
          ring_name: string
          no_of_gps?: number
          gp_span_name: string
          sag_location_identified?: boolean
          sag_location_photos?: any
          clamp_damaged?: boolean
          clamp_damage_photos?: any
          tension_clamp_count?: number
          suspension_clamp_count?: number
          new_pole_bend_identified?: boolean
          pole_damage?: boolean
          pole_damage_photos?: any
          pole_bend_new_poles?: boolean
          pole_bend_photos?: any
          loop_stand_issues?: boolean
          loop_stand_photos?: any
          tree_cutting_activity?: boolean
          tree_cutting_photos?: any
          joint_enclosure_problems?: boolean
          joint_enclosure_photos?: any
          cut_location_identified?: boolean
          cut_location_photos?: any
          other_activities_description?: string | null
          other_activities_photos?: any
          timestamp: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          user_email?: string
          mandal_name?: string
          location?: string
          ring_name?: string
          no_of_gps?: number
          gp_span_name?: string
          sag_location_identified?: boolean
          sag_location_photos?: any
          clamp_damaged?: boolean
          clamp_damage_photos?: any
          tension_clamp_count?: number
          suspension_clamp_count?: number
          new_pole_bend_identified?: boolean
          pole_damage?: boolean
          pole_damage_photos?: any
          pole_bend_new_poles?: boolean
          pole_bend_photos?: any
          loop_stand_issues?: boolean
          loop_stand_photos?: any
          tree_cutting_activity?: boolean
          tree_cutting_photos?: any
          joint_enclosure_problems?: boolean
          joint_enclosure_photos?: any
          cut_location_identified?: boolean
          cut_location_photos?: any
          other_activities_description?: string | null
          other_activities_photos?: any
          timestamp?: string
          created_at?: string
        }
      }
    }
  }
}
