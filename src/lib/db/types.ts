
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "activities": {
                  Row: {
                    "at": string,"body": string | null,"contact_id": string,"created_by": string | null,"id": string,"kind": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "at"?: string,"body"?: string | null,"contact_id": string,"created_by"?: string | null,"id"?: string,"kind": string,"workspace_id": string
                  }
                  Update: {
                    "at"?: string,"body"?: string | null,"contact_id"?: string,"created_by"?: string | null,"id"?: string,"kind"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "activities_contact_id_fkey"
      columns: ["contact_id"]
isOneToOne: false
      referencedRelation: "contacts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "activities_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"assistant_messages": {
                  Row: {
                    "content": string,"created_at": string,"id": string,"role": string,"thread_id": string,"ui": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: string,"created_at"?: string,"id"?: string,"role": string,"thread_id": string,"ui"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "content"?: string,"created_at"?: string,"id"?: string,"role"?: string,"thread_id"?: string,"ui"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assistant_messages_thread_id_fkey"
      columns: ["thread_id"]
isOneToOne: false
      referencedRelation: "assistant_threads"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "assistant_messages_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"assistant_threads": {
                  Row: {
                    "created_at": string,"id": string,"title": string | null,"updated_at": string,"user_id": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"title"?: string | null,"updated_at"?: string,"user_id": string,"workspace_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"title"?: string | null,"updated_at"?: string,"user_id"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assistant_threads_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"at": string,"entity": string | null,"entity_id": string | null,"id": number,"meta": NonNullable<Json>,"workspace_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"at"?: string,"entity"?: string | null,"entity_id"?: string | null,"id"?: never,"meta"?: NonNullable<Json>,"workspace_id"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"at"?: string,"entity"?: string | null,"entity_id"?: string | null,"id"?: never,"meta"?: NonNullable<Json>,"workspace_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_log_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"automations": {
                  Row: {
                    "active": boolean,"blurb": string,"included": boolean,"key": string,"monthly_cents": number,"name": string,"requires": string | null,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"blurb": string,"included"?: boolean,"key": string,"monthly_cents"?: number,"name": string,"requires"?: string | null,"sort"?: number
                  }
                  Update: {
                    "active"?: boolean,"blurb"?: string,"included"?: boolean,"key"?: string,"monthly_cents"?: number,"name"?: string,"requires"?: string | null,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"chatbot_configs": {
                  Row: {
                    "accent": string | null,"enabled": boolean,"greeting": string,"knowledge": string | null,"name": string,"site_key": string,"tone": string,"updated_at": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accent"?: string | null,"enabled"?: boolean,"greeting"?: string,"knowledge"?: string | null,"name"?: string,"site_key"?: string,"tone"?: string,"updated_at"?: string,"workspace_id": string
                  }
                  Update: {
                    "accent"?: string | null,"enabled"?: boolean,"greeting"?: string,"knowledge"?: string | null,"name"?: string,"site_key"?: string,"tone"?: string,"updated_at"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "chatbot_configs_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: true
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"chatbot_conversations": {
                  Row: {
                    "id": string,"last_at": string,"lead_contact": string | null,"message_count": number,"page_url": string | null,"started_at": string,"visitor_id": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"last_at"?: string,"lead_contact"?: string | null,"message_count"?: number,"page_url"?: string | null,"started_at"?: string,"visitor_id"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "id"?: string,"last_at"?: string,"lead_contact"?: string | null,"message_count"?: number,"page_url"?: string | null,"started_at"?: string,"visitor_id"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "chatbot_conversations_lead_contact_fkey"
      columns: ["lead_contact"]
isOneToOne: false
      referencedRelation: "contacts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "chatbot_conversations_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"chatbot_messages": {
                  Row: {
                    "content": string,"conversation_id": string,"created_at": string,"id": string,"role": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "content": string,"conversation_id": string,"created_at"?: string,"id"?: string,"role": string,"workspace_id": string
                  }
                  Update: {
                    "content"?: string,"conversation_id"?: string,"created_at"?: string,"id"?: string,"role"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "chatbot_messages_conversation_id_fkey"
      columns: ["conversation_id"]
isOneToOne: false
      referencedRelation: "chatbot_conversations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "chatbot_messages_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"contacts": {
                  Row: {
                    "address": NonNullable<Json>,"company": string | null,"created_at": string,"email": string | null,"first_name": string | null,"id": string,"last_activity_at": string | null,"last_name": string | null,"lat": number | null,"lng": number | null,"notes": string | null,"owner_id": string | null,"phone": string | null,"sms_opt_in": boolean,"sms_opt_in_at": string | null,"source": string | null,"stage": Database["public"]['Enums']["lead_stage"],"tags": (string)[],"updated_at": string,"value_cents": number | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: NonNullable<Json>,"company"?: string | null,"created_at"?: string,"email"?: string | null,"first_name"?: string | null,"id"?: string,"last_activity_at"?: string | null,"last_name"?: string | null,"lat"?: number | null,"lng"?: number | null,"notes"?: string | null,"owner_id"?: string | null,"phone"?: string | null,"sms_opt_in"?: boolean,"sms_opt_in_at"?: string | null,"source"?: string | null,"stage"?: Database["public"]['Enums']["lead_stage"],"tags"?: (string)[],"updated_at"?: string,"value_cents"?: number | null,"workspace_id": string
                  }
                  Update: {
                    "address"?: NonNullable<Json>,"company"?: string | null,"created_at"?: string,"email"?: string | null,"first_name"?: string | null,"id"?: string,"last_activity_at"?: string | null,"last_name"?: string | null,"lat"?: number | null,"lng"?: number | null,"notes"?: string | null,"owner_id"?: string | null,"phone"?: string | null,"sms_opt_in"?: boolean,"sms_opt_in_at"?: string | null,"source"?: string | null,"stage"?: Database["public"]['Enums']["lead_stage"],"tags"?: (string)[],"updated_at"?: string,"value_cents"?: number | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "contacts_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "all_day": boolean,"contact_id": string | null,"created_at": string,"created_by": string | null,"ends_at": string,"external_id": string | null,"id": string,"kind": string,"location": string | null,"notes": string | null,"source": string,"starts_at": string,"title": string,"updated_at": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "all_day"?: boolean,"contact_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"ends_at": string,"external_id"?: string | null,"id"?: string,"kind"?: string,"location"?: string | null,"notes"?: string | null,"source"?: string,"starts_at": string,"title": string,"updated_at"?: string,"workspace_id": string
                  }
                  Update: {
                    "all_day"?: boolean,"contact_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"ends_at"?: string,"external_id"?: string | null,"id"?: string,"kind"?: string,"location"?: string | null,"notes"?: string | null,"source"?: string,"starts_at"?: string,"title"?: string,"updated_at"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_contact_id_fkey"
      columns: ["contact_id"]
isOneToOne: false
      referencedRelation: "contacts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "events_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"files": {
                  Row: {
                    "bucket": string,"created_at": string,"id": string,"mime": string | null,"name": string,"path": string,"request_id": string | null,"size": number,"uploaded_by": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bucket"?: string,"created_at"?: string,"id"?: string,"mime"?: string | null,"name": string,"path": string,"request_id"?: string | null,"size"?: number,"uploaded_by"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "bucket"?: string,"created_at"?: string,"id"?: string,"mime"?: string | null,"name"?: string,"path"?: string,"request_id"?: string | null,"size"?: number,"uploaded_by"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "files_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "files_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"gbp_snapshots": {
                  Row: {
                    "calls": number | null,"day": string,"direction_requests": number | null,"photo_count": number | null,"post_count": number | null,"rating": number | null,"review_count": number | null,"searches": number | null,"views": number | null,"website_clicks": number | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "calls"?: number | null,"day": string,"direction_requests"?: number | null,"photo_count"?: number | null,"post_count"?: number | null,"rating"?: number | null,"review_count"?: number | null,"searches"?: number | null,"views"?: number | null,"website_clicks"?: number | null,"workspace_id": string
                  }
                  Update: {
                    "calls"?: number | null,"day"?: string,"direction_requests"?: number | null,"photo_count"?: number | null,"post_count"?: number | null,"rating"?: number | null,"review_count"?: number | null,"searches"?: number | null,"views"?: number | null,"website_clicks"?: number | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "gbp_snapshots_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"idempotency_keys": {
                  Row: {
                    "created_at": string,"key": string,"response": Json | null,"workspace_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"key": string,"response"?: Json | null,"workspace_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"key"?: string,"response"?: Json | null,"workspace_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "idempotency_keys_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"integrations": {
                  Row: {
                    "config": NonNullable<Json>,"connected_at": string | null,"id": string,"provider": string,"status": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "config"?: NonNullable<Json>,"connected_at"?: string | null,"id"?: string,"provider": string,"status"?: string,"workspace_id": string
                  }
                  Update: {
                    "config"?: NonNullable<Json>,"connected_at"?: string | null,"id"?: string,"provider"?: string,"status"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "integrations_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"invites": {
                  Row: {
                    "accepted_at": string | null,"created_at": string,"created_by": string | null,"email": string,"expires_at": string,"id": string,"permissions": NonNullable<Json>,"role": Database["public"]['Enums']["member_role"],"token": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"email": string,"expires_at"?: string,"id"?: string,"permissions"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["member_role"],"token"?: string,"workspace_id": string
                  }
                  Update: {
                    "accepted_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"email"?: string,"expires_at"?: string,"id"?: string,"permissions"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["member_role"],"token"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invites_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"invoices": {
                  Row: {
                    "amount_cents": number,"created_at": string,"description": string | null,"due_date": string | null,"hosted_url": string | null,"id": string,"line_items": NonNullable<Json>,"number": number,"paid_at": string | null,"pdf_url": string | null,"status": Database["public"]['Enums']["invoice_status"],"stripe_invoice_id": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"created_at"?: string,"description"?: string | null,"due_date"?: string | null,"hosted_url"?: string | null,"id"?: string,"line_items"?: NonNullable<Json>,"number": number,"paid_at"?: string | null,"pdf_url"?: string | null,"status"?: Database["public"]['Enums']["invoice_status"],"stripe_invoice_id"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "amount_cents"?: number,"created_at"?: string,"description"?: string | null,"due_date"?: string | null,"hosted_url"?: string | null,"id"?: string,"line_items"?: NonNullable<Json>,"number"?: number,"paid_at"?: string | null,"pdf_url"?: string | null,"status"?: Database["public"]['Enums']["invoice_status"],"stripe_invoice_id"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "invoices_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"memberships": {
                  Row: {
                    "created_at": string,"invited_by": string | null,"permissions": NonNullable<Json>,"role": Database["public"]['Enums']["member_role"],"user_id": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"invited_by"?: string | null,"permissions"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["member_role"],"user_id": string,"workspace_id": string
                  }
                  Update: {
                    "created_at"?: string,"invited_by"?: string | null,"permissions"?: NonNullable<Json>,"role"?: Database["public"]['Enums']["member_role"],"user_id"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "memberships_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"metrics_daily": {
                  Row: {
                    "day": string,"metric": string,"source": string,"value": number,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "day": string,"metric": string,"source": string,"value"?: number,"workspace_id": string
                  }
                  Update: {
                    "day"?: string,"metric"?: string,"source"?: string,"value"?: number,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "metrics_daily_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"modules": {
                  Row: {
                    "active": boolean,"blurb": string,"included_in": (string)[],"key": string,"kind": string,"metered": Json | null,"monthly_cents": number,"name": string,"sort": number
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"blurb": string,"included_in"?: (string)[],"key": string,"kind": string,"metered"?: Json | null,"monthly_cents"?: number,"name": string,"sort"?: number
                  }
                  Update: {
                    "active"?: boolean,"blurb"?: string,"included_in"?: (string)[],"key"?: string,"kind"?: string,"metered"?: Json | null,"monthly_cents"?: number,"name"?: string,"sort"?: number
                  }
                  Relationships: [
                    
                  ]
                },"notifications": {
                  Row: {
                    "body": string | null,"created_at": string,"href": string | null,"id": string,"kind": string,"read_at": string | null,"title": string,"user_id": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body"?: string | null,"created_at"?: string,"href"?: string | null,"id"?: string,"kind": string,"read_at"?: string | null,"title": string,"user_id"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "body"?: string | null,"created_at"?: string,"href"?: string | null,"id"?: string,"kind"?: string,"read_at"?: string | null,"title"?: string,"user_id"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string,"full_name": string | null,"is_staff": boolean,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string,"full_name"?: string | null,"is_staff"?: boolean,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string,"full_name"?: string | null,"is_staff"?: boolean,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"quotes": {
                  Row: {
                    "contact_id": string | null,"created_at": string,"created_by": string | null,"id": string,"line_items": NonNullable<Json>,"sent_at": string | null,"status": string,"title": string,"total_cents": number,"updated_at": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "contact_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"line_items"?: NonNullable<Json>,"sent_at"?: string | null,"status"?: string,"title": string,"total_cents"?: number,"updated_at"?: string,"workspace_id": string
                  }
                  Update: {
                    "contact_id"?: string | null,"created_at"?: string,"created_by"?: string | null,"id"?: string,"line_items"?: NonNullable<Json>,"sent_at"?: string | null,"status"?: string,"title"?: string,"total_cents"?: number,"updated_at"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "quotes_contact_id_fkey"
      columns: ["contact_id"]
isOneToOne: false
      referencedRelation: "contacts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "quotes_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"request_comments": {
                  Row: {
                    "author_id": string | null,"body": string,"created_at": string,"from_staff": boolean,"id": string,"internal": boolean,"request_id": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body": string,"created_at"?: string,"from_staff"?: boolean,"id"?: string,"internal"?: boolean,"request_id": string,"workspace_id": string
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string,"created_at"?: string,"from_staff"?: boolean,"id"?: string,"internal"?: boolean,"request_id"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "request_comments_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "request_comments_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"requests": {
                  Row: {
                    "assigned_staff": string | null,"completed_at": string | null,"created_at": string,"created_by": string | null,"description": string | null,"due_date": string | null,"estimate_hours": number | null,"id": string,"kind": Database["public"]['Enums']["request_kind"],"number": number,"priority": Database["public"]['Enums']["request_priority"],"status": Database["public"]['Enums']["request_status"],"title": string,"updated_at": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_staff"?: string | null,"completed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"due_date"?: string | null,"estimate_hours"?: number | null,"id"?: string,"kind"?: Database["public"]['Enums']["request_kind"],"number": number,"priority"?: Database["public"]['Enums']["request_priority"],"status"?: Database["public"]['Enums']["request_status"],"title": string,"updated_at"?: string,"workspace_id": string
                  }
                  Update: {
                    "assigned_staff"?: string | null,"completed_at"?: string | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"due_date"?: string | null,"estimate_hours"?: number | null,"id"?: string,"kind"?: Database["public"]['Enums']["request_kind"],"number"?: number,"priority"?: Database["public"]['Enums']["request_priority"],"status"?: Database["public"]['Enums']["request_status"],"title"?: string,"updated_at"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "requests_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"review_requests": {
                  Row: {
                    "clicked_at": string | null,"contact_id": string | null,"created_at": string,"id": string,"reviewed_at": string | null,"sent_at": string | null,"status": string,"to_name": string | null,"to_phone": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "clicked_at"?: string | null,"contact_id"?: string | null,"created_at"?: string,"id"?: string,"reviewed_at"?: string | null,"sent_at"?: string | null,"status"?: string,"to_name"?: string | null,"to_phone": string,"workspace_id": string
                  }
                  Update: {
                    "clicked_at"?: string | null,"contact_id"?: string | null,"created_at"?: string,"id"?: string,"reviewed_at"?: string | null,"sent_at"?: string | null,"status"?: string,"to_name"?: string | null,"to_phone"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "review_requests_contact_id_fkey"
      columns: ["contact_id"]
isOneToOne: false
      referencedRelation: "contacts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "review_requests_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"reviews": {
                  Row: {
                    "author": string | null,"body": string | null,"external_id": string | null,"id": string,"posted_at": string,"rating": number | null,"replied_at": string | null,"reply": string | null,"source": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "author"?: string | null,"body"?: string | null,"external_id"?: string | null,"id"?: string,"posted_at"?: string,"rating"?: number | null,"replied_at"?: string | null,"reply"?: string | null,"source"?: string,"workspace_id": string
                  }
                  Update: {
                    "author"?: string | null,"body"?: string | null,"external_id"?: string | null,"id"?: string,"posted_at"?: string,"rating"?: number | null,"replied_at"?: string | null,"reply"?: string | null,"source"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reviews_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"sms_registrations": {
                  Row: {
                    "business": NonNullable<Json>,"campaign": NonNullable<Json>,"consent": NonNullable<Json>,"contact": NonNullable<Json>,"created_at": string,"id": string,"status": Database["public"]['Enums']["sms_registration_status"],"submitted_at": string | null,"twilio": NonNullable<Json>,"updated_at": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "business"?: NonNullable<Json>,"campaign"?: NonNullable<Json>,"consent"?: NonNullable<Json>,"contact"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"status"?: Database["public"]['Enums']["sms_registration_status"],"submitted_at"?: string | null,"twilio"?: NonNullable<Json>,"updated_at"?: string,"workspace_id": string
                  }
                  Update: {
                    "business"?: NonNullable<Json>,"campaign"?: NonNullable<Json>,"consent"?: NonNullable<Json>,"contact"?: NonNullable<Json>,"created_at"?: string,"id"?: string,"status"?: Database["public"]['Enums']["sms_registration_status"],"submitted_at"?: string | null,"twilio"?: NonNullable<Json>,"updated_at"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "sms_registrations_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: true
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"staff": {
                  Row: {
                    "created_at": string,"role": Database["public"]['Enums']["staff_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"role"?: Database["public"]['Enums']["staff_role"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"role"?: Database["public"]['Enums']["staff_role"],"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"transactions": {
                  Row: {
                    "amount_cents": number,"at": string,"category": string | null,"created_at": string,"external_id": string | null,"id": string,"memo": string | null,"source": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"at"?: string,"category"?: string | null,"created_at"?: string,"external_id"?: string | null,"id"?: string,"memo"?: string | null,"source"?: string,"workspace_id": string
                  }
                  Update: {
                    "amount_cents"?: number,"at"?: string,"category"?: string | null,"created_at"?: string,"external_id"?: string | null,"id"?: string,"memo"?: string | null,"source"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "transactions_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"webhook_events": {
                  Row: {
                    "id": string,"processed_at": string | null,"provider": string,"received_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id": string,"processed_at"?: string | null,"provider": string,"received_at"?: string
                  }
                  Update: {
                    "id"?: string,"processed_at"?: string | null,"provider"?: string,"received_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"workspace_automations": {
                  Row: {
                    "activated_at": string,"automation_key": string,"config": NonNullable<Json>,"status": Database["public"]['Enums']["automation_status"],"stripe_item_id": string | null,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activated_at"?: string,"automation_key": string,"config"?: NonNullable<Json>,"status"?: Database["public"]['Enums']["automation_status"],"stripe_item_id"?: string | null,"workspace_id": string
                  }
                  Update: {
                    "activated_at"?: string,"automation_key"?: string,"config"?: NonNullable<Json>,"status"?: Database["public"]['Enums']["automation_status"],"stripe_item_id"?: string | null,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "workspace_automations_automation_key_fkey"
      columns: ["automation_key"]
isOneToOne: false
      referencedRelation: "automations"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "workspace_automations_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"workspace_counters": {
                  Row: {
                    "name": string,"value": number,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "name": string,"value"?: number,"workspace_id": string
                  }
                  Update: {
                    "name"?: string,"value"?: number,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "workspace_counters_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"workspace_modules": {
                  Row: {
                    "activated_at": string,"cancel_at": string | null,"module_key": string,"status": Database["public"]['Enums']["module_status"],"stripe_item_id": string | null,"trial_ends_at": string | null,"usage_count": number,"usage_period_start": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "activated_at"?: string,"cancel_at"?: string | null,"module_key": string,"status"?: Database["public"]['Enums']["module_status"],"stripe_item_id"?: string | null,"trial_ends_at"?: string | null,"usage_count"?: number,"usage_period_start"?: string,"workspace_id": string
                  }
                  Update: {
                    "activated_at"?: string,"cancel_at"?: string | null,"module_key"?: string,"status"?: Database["public"]['Enums']["module_status"],"stripe_item_id"?: string | null,"trial_ends_at"?: string | null,"usage_count"?: number,"usage_period_start"?: string,"workspace_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "workspace_modules_module_key_fkey"
      columns: ["module_key"]
isOneToOne: false
      referencedRelation: "modules"
      referencedColumns: ["key"]
    },{
      foreignKeyName: "workspace_modules_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                },"workspaces": {
                  Row: {
                    "address": NonNullable<Json>,"created_at": string,"created_by": string | null,"email": string | null,"gbp_url": string | null,"id": string,"industry": string | null,"legal_name": string | null,"name": string,"onboarding": NonNullable<Json>,"onboarding_completed_at": string | null,"phone": string | null,"plan_key": string,"plan_status": string,"slug": string,"stripe_customer_id": string | null,"stripe_subscription_id": string | null,"theme": NonNullable<Json>,"updated_at": string,"website": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"email"?: string | null,"gbp_url"?: string | null,"id"?: string,"industry"?: string | null,"legal_name"?: string | null,"name": string,"onboarding"?: NonNullable<Json>,"onboarding_completed_at"?: string | null,"phone"?: string | null,"plan_key"?: string,"plan_status"?: string,"slug": string,"stripe_customer_id"?: string | null,"stripe_subscription_id"?: string | null,"theme"?: NonNullable<Json>,"updated_at"?: string,"website"?: string | null
                  }
                  Update: {
                    "address"?: NonNullable<Json>,"created_at"?: string,"created_by"?: string | null,"email"?: string | null,"gbp_url"?: string | null,"id"?: string,"industry"?: string | null,"legal_name"?: string | null,"name"?: string,"onboarding"?: NonNullable<Json>,"onboarding_completed_at"?: string | null,"phone"?: string | null,"plan_key"?: string,"plan_status"?: string,"slug"?: string,"stripe_customer_id"?: string | null,"stripe_subscription_id"?: string | null,"theme"?: NonNullable<Json>,"updated_at"?: string,"website"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "workspace_members": {
                  Row: {
                    "created_at": string,"permissions": NonNullable<Json>,"role": Database["public"]['Enums']["member_role"],"user_id": string,"workspace_id": string
                  }
                  ComputedFields: never
                  Insert: {
                           "created_at"?: string | null,"permissions"?: Json | null,"role"?: Database["public"]['Enums']["member_role"] | null,"user_id"?: string | null,"workspace_id"?: string | null
                         }
                        Update: {
                           "created_at"?: string | null,"permissions"?: Json | null,"role"?: Database["public"]['Enums']["member_role"] | null,"user_id"?: string | null,"workspace_id"?: string | null
                         }
                        Relationships: [
                    {
      foreignKeyName: "memberships_workspace_id_fkey"
      columns: ["workspace_id"]
isOneToOne: false
      referencedRelation: "workspaces"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Functions: {
            "apply_tenant_policies":
{ Args: { "module": string,"tbl": unknown }; Returns: undefined
                           },
"can_write":
{ Args: { "module": string,"ws": string }; Returns: boolean
                           },
"is_member":
{ Args: { "ws": string }; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_workspace_admin":
{ Args: { "ws": string }; Returns: boolean
                           },
"is_workspace_member":
{ Args: { "ws": string }; Returns: boolean
                           },
"member_role":
{ Args: { "ws": string }; Returns: Database["public"]['Enums']["member_role"]
                           },
"my_workspace_ids":
{ Args: Record<PropertyKey, never>; Returns: string[]
                           },
"next_counter":
{ Args: { "counter": string,"ws": string }; Returns: number
                           },
"workspace_role":
{ Args: { "ws": string }; Returns: string
                           }
          }
          Enums: {
            "automation_status": "included"|"active"|"paused"|"available","invoice_status": "draft"|"open"|"paid"|"overdue"|"void","lead_stage": "new"|"contacted"|"qualified"|"proposal"|"won"|"lost","member_role": "owner"|"admin"|"member","module_status": "included"|"active"|"trial"|"paused"|"cancelled","request_kind": "work"|"change"|"bug"|"question","request_priority": "low"|"normal"|"high"|"urgent","request_status": "open"|"in_progress"|"waiting_on_client"|"review"|"done"|"cancelled","sms_registration_status": "draft"|"submitted"|"brand_approved"|"campaign_approved"|"live"|"rejected","staff_role": "owner"|"member"|"dev"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "automation_status": ["included", "active", "paused", "available"],"invoice_status": ["draft", "open", "paid", "overdue", "void"],"lead_stage": ["new", "contacted", "qualified", "proposal", "won", "lost"],"member_role": ["owner", "admin", "member"],"module_status": ["included", "active", "trial", "paused", "cancelled"],"request_kind": ["work", "change", "bug", "question"],"request_priority": ["low", "normal", "high", "urgent"],"request_status": ["open", "in_progress", "waiting_on_client", "review", "done", "cancelled"],"sms_registration_status": ["draft", "submitted", "brand_approved", "campaign_approved", "live", "rejected"],"staff_role": ["owner", "member", "dev"]
          }
        }
} as const
