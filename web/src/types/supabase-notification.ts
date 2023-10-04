export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string;
          id: string;
          message: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          message: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          message?: string;
          subject?: string;
        };
        Relationships: [];
      };
      "discord-broadcast": {
        Row: {
          channel: string | null;
          index: string;
          message: string;
          network: number;
          processed: boolean | null;
          status: string | null;
          TTL: string | null;
          tx: string;
        };
        Insert: {
          channel?: string | null;
          index: string;
          message: string;
          network: number;
          processed?: boolean | null;
          status?: string | null;
          TTL?: string | null;
          tx: string;
        };
        Update: {
          channel?: string | null;
          index?: string;
          message?: string;
          network?: number;
          processed?: boolean | null;
          status?: string | null;
          TTL?: string | null;
          tx?: string;
        };
        Relationships: [];
      };
      "hermes-tg-counters": {
        Row: {
          bot_name: string;
          chainid: number;
          counter: number | null;
        };
        Insert: {
          bot_name: string;
          chainid: number;
          counter?: number | null;
        };
        Update: {
          bot_name?: string;
          chainid?: number;
          counter?: number | null;
        };
        Relationships: [];
      };
      "hermes-tg-counters-testing": {
        Row: {
          blockHeight: number;
          bot_name: string;
          indexLast: string;
          network: number;
        };
        Insert: {
          blockHeight?: number;
          bot_name: string;
          indexLast?: string;
          network: number;
        };
        Update: {
          blockHeight?: number;
          bot_name?: string;
          indexLast?: string;
          network?: number;
        };
        Relationships: [];
      };
      "sendgrid-scheduler": {
        Row: {
          address: string;
          chain_id: number | null;
          created_at: string | null;
          dapp: string | null;
          dynamic_template_data: Json | null;
          email_delivered: boolean;
          email_desired: boolean;
          expiry: string | null;
          index: number;
          template_id: string | null;
          tx: string;
        };
        Insert: {
          address: string;
          chain_id?: number | null;
          created_at?: string | null;
          dapp?: string | null;
          dynamic_template_data?: Json | null;
          email_delivered?: boolean;
          email_desired: boolean;
          expiry?: string | null;
          index: number;
          template_id?: string | null;
          tx: string;
        };
        Update: {
          address?: string;
          chain_id?: number | null;
          created_at?: string | null;
          dapp?: string | null;
          dynamic_template_data?: Json | null;
          email_delivered?: boolean;
          email_desired?: boolean;
          expiry?: string | null;
          index?: number;
          template_id?: string | null;
          tx?: string;
        };
        Relationships: [];
      };
      "tg-juror-subscriptions": {
        Row: {
          juror_address: string;
          tg_user_id: number;
        };
        Insert: {
          juror_address: string;
          tg_user_id: number;
        };
        Update: {
          juror_address?: string;
          tg_user_id?: number;
        };
        Relationships: [];
      };
      "user-public-messages": {
        Row: {
          address: string;
          chain_id: number | null;
          created_at: string | null;
          dapp: string | null;
          id: string;
          message: string;
          tx: string | null;
        };
        Insert: {
          address: string;
          chain_id?: number | null;
          created_at?: string | null;
          dapp?: string | null;
          id?: string;
          message: string;
          tx?: string | null;
        };
        Update: {
          address?: string;
          chain_id?: number | null;
          created_at?: string | null;
          dapp?: string | null;
          id?: string;
          message?: string;
          tx?: string | null;
        };
        Relationships: [];
      };
      "user-settings": {
        Row: {
          address: string;
          email: string | null;
          push: boolean | null;
          telegram: string | null;
        };
        Insert: {
          address: string;
          email?: string | null;
          push?: boolean | null;
          telegram?: string | null;
        };
        Update: {
          address?: string;
          email?: string | null;
          push?: boolean | null;
          telegram?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_subscribers: {
        Args: {
          vals: string[];
        };
        Returns: {
          juror_address: string;
          tg_user_id: number;
        }[];
      };
      hello_world: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      tg_users_subscribed_to: {
        Args: {
          vals: string[];
        };
        Returns: {
          juror_address: string;
          tg_user_id: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
