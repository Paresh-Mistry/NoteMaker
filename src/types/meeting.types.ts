import { FathomActionItem, FathomInvitee, FathomSummary, FathomTranscriptLine } from "."

export interface FathomMeeting {
  id: string
  title: string
  meeting_title?: string
  url: string
  share_url: string
  created_at: string
  recording_start_time?: string
  recording_end_time?: string
  meeting_type?: string
  transcript_language?: string
  recording_id: number
  calendar_invitees_domains_type?: string
  calendar_invitees?: FathomInvitee[]
  transcript?: FathomTranscriptLine[]
  default_summary?: FathomSummary
  action_items?: FathomActionItem[]
  recorded_by?: { name: string; email: string; team?: string }
}

export interface TranscriptLine {
  timestamp: string;
  text: string;
  speaker: {
    display_name: string;
  };
}
