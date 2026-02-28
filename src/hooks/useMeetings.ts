import { meetingService } from "@/services/meetingService";
import { useInfiniteQuery, useQuery } from "react-query";

export const meetingKeys = {
    all: ["meetings"] as const,

    lists: () => [...meetingKeys.all, "list"] as const,

    detail: (id: string) =>
        [...meetingKeys.all, "detail", id] as const,

    transcript: (recording_id: string) =>
        [...meetingKeys.all, "transcript", recording_id] as const,
};


export const useAllMeetings = (enabled: boolean = true) => {
    return useQuery({
        queryKey: meetingKeys.lists(),
        queryFn: meetingService.getAllMeetings,
        enabled,
    });
};


export const useMeetingById = (
    id: string,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: meetingKeys.detail(id),
        queryFn: () => meetingService.getMeetingById(id),
        enabled: enabled && !!id,
    });
};


export const useTranscriptByRecordingId = (
    recording_id: string,
    enabled: boolean = true
) => {
    return useQuery({
        queryKey: meetingKeys.transcript(recording_id),
        queryFn: () =>
            meetingService.getTranscriptByRecordingId(recording_id),
        enabled: enabled && !!recording_id,
    });
};


export const useInfiniteMeetings = () => {
    return useInfiniteQuery({
        queryKey: meetingKeys.lists(),
        queryFn: () => meetingService.getAllMeetings(),
        getNextPageParam: (lastPage) => {
            return lastPage?.next_cursor ?? undefined;
        },
    })
}

