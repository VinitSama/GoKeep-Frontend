import { Injectable } from '@angular/core';
import { API } from '../config/app.config';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';
import { ApiResponseModel } from '../models/api-response-model';
import { NoteLabelRequestModel } from '../models/note-label-request-model';

@Injectable({
  providedIn: 'root'
})
export class NoteLabelService {

  private api = `${API.api}/noteLabel`;
  
  constructor(private http: HttpClient) { }

  async getNoteLabels(noteId: number) {
    try {
      const url = `${this.api}/noteid/${noteId}`;
      const response = await firstValueFrom(this.http.get<ApiResponseModel<Array<number>>>(url));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async getNoteIdByLabelId(labelId: number) {
    try {
      const url = `${this.api}/labelId/${labelId}`;
      const response = await firstValueFrom(this.http.get<ApiResponseModel<Array<number>>>(url));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async addNoteLabel(noteLabelCreateModel: NoteLabelRequestModel) {
    try {
      const response = await firstValueFrom(this.http.post<ApiResponseModel<null>>(this.api, noteLabelCreateModel));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async deleteNoteLabel(noteLabelDeleteModel: NoteLabelRequestModel) {
    try {
      const url = `${this.api}/${noteLabelDeleteModel.noteId}/${noteLabelDeleteModel.labelId}`;
      const response = await firstValueFrom(this.http.delete<ApiResponseModel<null>>(url));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

}
