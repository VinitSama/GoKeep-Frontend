export interface Note {
    noteId: number;
    title: string;
    content: string;
    isPinned: boolean;
    isArchived: boolean;
    isTrashed: boolean;
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    labelIds: Array<number>;
  }  