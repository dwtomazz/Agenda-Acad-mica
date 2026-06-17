export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      atividade_concluida: {
        Row: {
          aluno_id: string
          atividade_id: string
          concluida_em: string
        }
        Insert: {
          aluno_id: string
          atividade_id: string
          concluida_em?: string
        }
        Update: {
          aluno_id?: string
          atividade_id?: string
          concluida_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividade_concluida_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividade_concluida_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      atividades: {
        Row: {
          created_at: string
          criada_por: string | null
          descricao: string | null
          disciplina_id: string | null
          id: string
          prazo: string | null
          titulo: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criada_por?: string | null
          descricao?: string | null
          disciplina_id?: string | null
          id?: string
          prazo?: string | null
          titulo: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criada_por?: string | null
          descricao?: string | null
          disciplina_id?: string | null
          id?: string
          prazo?: string | null
          titulo?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "atividades_criada_por_fkey"
            columns: ["criada_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atividades_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos: {
        Row: {
          conteudo: string
          created_at: string
          criado_por: string | null
          escopo: string
          id: string
          titulo: string
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          criado_por?: string | null
          escopo?: string
          id?: string
          titulo: string
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          criado_por?: string | null
          escopo?: string
          id?: string
          titulo?: string
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "avisos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "avisos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      disciplinas: {
        Row: {
          codigo: string | null
          created_at: string
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          codigo?: string | null
          created_at?: string
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          codigo?: string | null
          created_at?: string
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      entregas: {
        Row: {
          aluno_id: string
          arquivo_url: string | null
          atividade_id: string
          comentario_aluno: string | null
          comentario_prof: string | null
          entregue_em: string
          id: string
          nota: number | null
          updated_at: string
        }
        Insert: {
          aluno_id: string
          arquivo_url?: string | null
          atividade_id: string
          comentario_aluno?: string | null
          comentario_prof?: string | null
          entregue_em?: string
          id?: string
          nota?: number | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          arquivo_url?: string | null
          atividade_id?: string
          comentario_aluno?: string | null
          comentario_prof?: string | null
          entregue_em?: string
          id?: string
          nota?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entregas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entregas_atividade_id_fkey"
            columns: ["atividade_id"]
            isOneToOne: false
            referencedRelation: "atividades"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          created_at: string
          criado_por: string | null
          data: string
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          turma_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por?: string | null
          data: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo: string
          turma_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          turma_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      frequencias: {
        Row: {
          aluno_id: string
          created_at: string
          data: string
          id: string
          lancada_por: string | null
          presente: boolean
          turma_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          data: string
          id?: string
          lancada_por?: string | null
          presente?: boolean
          turma_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          data?: string
          id?: string
          lancada_por?: string | null
          presente?: boolean
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequencias_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frequencias_lancada_por_fkey"
            columns: ["lancada_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "frequencias_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      notas: {
        Row: {
          aluno_id: string
          created_at: string
          descricao: string
          id: string
          lancada_por: string | null
          peso: number
          turma_id: string
          updated_at: string
          valor: number
        }
        Insert: {
          aluno_id: string
          created_at?: string
          descricao: string
          id?: string
          lancada_por?: string | null
          peso?: number
          turma_id: string
          updated_at?: string
          valor: number
        }
        Update: {
          aluno_id?: string
          created_at?: string
          descricao?: string
          id?: string
          lancada_por?: string | null
          peso?: number
          turma_id?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "notas_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_lancada_por_fkey"
            columns: ["lancada_por"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          area: string | null
          ativo: boolean
          avatar_url: string | null
          bio: string | null
          created_at: string
          full_name: string
          id: string
        }
        Insert: {
          area?: string | null
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id: string
        }
        Update: {
          area?: string | null
          ativo?: boolean
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      turma_alunos: {
        Row: {
          aluno_id: string
          created_at: string
          turma_id: string
        }
        Insert: {
          aluno_id: string
          created_at?: string
          turma_id: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          turma_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "turma_alunos_aluno_id_fkey"
            columns: ["aluno_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turma_alunos_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas: {
        Row: {
          ano: number
          created_at: string
          disciplina_id: string | null
          id: string
          nome: string
          professor_id: string | null
          updated_at: string
        }
        Insert: {
          ano?: number
          created_at?: string
          disciplina_id?: string | null
          id?: string
          nome: string
          professor_id?: string | null
          updated_at?: string
        }
        Update: {
          ano?: number
          created_at?: string
          disciplina_id?: string | null
          id?: string
          nome?: string
          professor_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_disciplina_id_fkey"
            columns: ["disciplina_id"]
            isOneToOne: false
            referencedRelation: "disciplinas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_professor_id_fkey"
            columns: ["professor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      entrega_turma: { Args: { _atividade_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_turma_aluno: {
        Args: { _turma_id: string; _user_id: string }
        Returns: boolean
      }
      is_turma_professor: {
        Args: { _turma_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "aluno" | "professor" | "administrador"
      event_type: "aula" | "prova" | "seminario" | "atividade"
      material_type: "arquivo" | "link" | "aula_gravada"
      member_status: "pendente" | "aprovado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
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
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["aluno", "professor", "administrador"],
      event_type: ["aula", "prova", "seminario", "atividade"],
      material_type: ["arquivo", "link", "aula_gravada"],
      member_status: ["pendente", "aprovado"],
    },
  },
} as const
