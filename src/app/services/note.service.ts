import { Injectable } from '@angular/core';
import { API } from '../config/app.config';
import { HttpClient } from '@angular/common/http';
import { NoteCreateRequestModel } from '../models/note-create-request-model';
import { firstValueFrom, Subject } from 'rxjs';
import { ApiResponseModel } from '../models/api-response-model';
import { LocalSaveService } from './local-save.service';
import { Note } from '../models/note';
import { NoteUpdateRequestModel } from '../models/note-update-request-model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  
  private api = API.api;

  constructor(
    private http: HttpClient,
    private localSaveService: LocalSaveService,
  ) { }

  async createNewNote(noteModel: NoteCreateRequestModel) {
    try {
      const url = `${this.api}/notes`;
      const response = await firstValueFrom(this.http.post<ApiResponseModel<number>>(url, noteModel));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async getAllNotes() {
    try {
      const url = `${this.api}/notes`;
      const response = await firstValueFrom(this.http.get<ApiResponseModel<Array<Note>>>(url));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async updateNotes(noteId: number, updateNoteModel: NoteUpdateRequestModel) {
    try {
      const url = `${this.api}/notes/${noteId}`;
      const response = await firstValueFrom(this.http.put<ApiResponseModel<null>>(url, updateNoteModel))
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }
  
  async toggleOption(noteId: number, optionName: 'togglePin' | 'toggleArchive' | 'toggleTrash') {
    try {
      const url = `${this.api}/notes/${optionName}/${noteId}`;
      const response = await firstValueFrom(this.http.get<ApiResponseModel<null>>(url));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async deleteForever(noteId: number) {
    try {
      const url = `${this.api}/notes/forever/${noteId}`;
      const response = await firstValueFrom(this.http.delete<ApiResponseModel<null>>(url));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

}
