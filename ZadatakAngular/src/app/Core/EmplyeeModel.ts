export interface EmployeeModel {
    id : string
    employeeName: string;
    startTimeUtc: Date;
    endTimeUtc: Date;
    entryNotes: string;
    deletedOn?: Date | null;
}