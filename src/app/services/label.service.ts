import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API } from '../config/app.config';
import { LocalSaveService } from './local-save.service';
import { Label } from '../models/label';
import { firstValueFrom, Subject } from 'rxjs';
import { ApiResponseModel } from '../models/api-response-model';
import { LabelCreateResponseModel } from '../models/label-create-response-model';
import { LabelCreateRequestModel } from '../models/label-create-request-model';

@Injectable({
  providedIn: 'root'
})
export class LabelService {

  private api = `${API.api}/label`;

  constructor(private http: HttpClient, private localSaveService: LocalSaveService) {}


  async getAllLabels() {
    try {
      const response = await firstValueFrom(this.http.get<ApiResponseModel<Array<Label>>>(this.api));
      return response
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async addNewLabel(label: LabelCreateRequestModel) {
    try{
      const response = await firstValueFrom(this.http.post<ApiResponseModel<number>>(this.api, label));
      return response;
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async deleteLabel(labelId: number) {
    try{
      const url = `${this.api}/${labelId}`;
      const response = await firstValueFrom(this.http.delete<ApiResponseModel<null>>(url));
      return response
    } catch (error) {
      console.error(error);
      return;
    }
  }

  async updateLabel(LabelId: number, label: string) {
    try{
      const body = {
        id: LabelId,
        name: label
      };
      const response = await firstValueFrom(this.http.put<ApiResponseModel<null>>(this.api, body));
      return response
    } catch (error) {
      console.error(error);
      return;
    }
  }
}
