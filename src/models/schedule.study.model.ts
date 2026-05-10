export type StudyStatus = 'pending' | 'done' | 'miss' ;

export interface StudySchedule {
    study_schedule_id: number;
    title: string;
    description?: string;
    start_time?: string; 
    end_time?: string;   
    status?: StudyStatus;
    target_question?: number;
    created_at?: string;
    update_at?: string;
    subject_id?: number ;
}
