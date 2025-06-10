export interface NoteCreateRequestModel {
    title: string;
    content: string;
    isPinned: boolean;
    isArchived: boolean;
    isTrashed: boolean;
}
