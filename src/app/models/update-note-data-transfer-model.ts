export interface UpdateNoteDataTransferModel {
    createNewNote?: number;
    toggleOption?: 'togglePin' | 'toggleArchive' | 'toggleTrash';
    title?: string;
    content?: string;
}
