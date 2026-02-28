export type Status = 'idle' | 'loading' | 'processing' | 'done' | 'error'

export interface FathomSpeaker {
  display_name: string
  matched_calendar_invitee_email?: string
}

export interface FathomTranscriptLine {
  speaker: FathomSpeaker
  text: string
  timestamp: string
}

export interface FathomInvitee {
  name: string
  email: string
  is_external: boolean
}

export interface FathomSummary {
  template_name: string
  markdown_formatted: string
}

export interface FathomActionItem {
  description: string
  completed: boolean
  assignee?: { name: string; email: string }
  recording_timestamp?: string
}

export interface Notes {
  summary: string
  key_points: string[]
  action_items: string[]
  decisions: string[]
  follow_ups: string[]
  meeting_title: string
  meeting_date: string
}