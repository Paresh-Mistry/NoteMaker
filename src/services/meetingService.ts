import { apiInstance } from "@/lib/apiIntance";
import { FathomMeeting, TranscriptLine } from "@/types/meeting.types";




export const meetingService = {
  // Get all meetings
  getAllMeetings: async (): Promise<FathomMeeting[]> => {
    const response = await apiInstance.get<{ meetings: FathomMeeting[] }>(
      "/meeting"
    );
    return response.data.meetings;  
  },

  // Get meeting by ID
  getMeetingById: async (id: string): Promise<FathomMeeting> => {
    const response = await apiInstance.get<{ meetings: FathomMeeting[] }>(
      "/meeting"
    );

    const found = response.data.meetings.find(
      (m: FathomMeeting) => String(m.recording_id) === String(id)
    );

    if (!found) {
      throw new Error("Meeting not found");
    }

    return found;
  },

  // Get transcript by recording_id
  getTranscriptByRecordingId: async (
    recording_id: string
  ): Promise<TranscriptLine[]> => {
    const response = await apiInstance.get<{ transcript: TranscriptLine[] }>(
      "/transcript",
      {
        params: { recording_id },
      }
    );

    return response.data.transcript || [];
  },
};
