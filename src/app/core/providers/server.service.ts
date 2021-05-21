import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  // holds the API base URL
  private baseUrl: string;

  // holds the active token (if logged in)
  private token: string;
  private tokenKey: string;

  constructor(
    private $http: HttpClient,
    private $storage: StorageService,
  ) {

    // the base URL of the API script
    this.baseUrl = environment.baseUrl;
    this.tokenKey = environment.tokenKey;
  }

  /**
   * Get the active token
   * @returns {string}
   */
  public getToken(): string {

    if (!this.token) {
      this.loadToken();
    }

    return this.token;
  }

  /**
   * Load the token (from storage if needed)
   * @returns {void}
   */
  public loadToken(): void {
    this.token = this.token || this.$storage.get(this.tokenKey) || this.$storage.getCookie(this.tokenKey) || null;
    return;
  }

  /**
   * Set/save the token
   * @param {string} token User token
   * @returns {void}
   */
  public setToken(token: string, rememberMe?: boolean): void {

    // save in service
    this.token = token;

    // save to storage
    if (rememberMe) {
      this.$storage.set(this.tokenKey, token);
      this.$storage.setCookie(this.tokenKey, token, 300);
    }

    return;
  }

  public updateTokenCookie(): void {
    this.$storage.setCookie(this.tokenKey, this.getToken(), 300);
  }

  /**
   * Update the token
   * @param {string} token User token
   * @returns {void}
   */
  public updateToken(token: string): void {

    this.token = token;

    // check if locally stored
    if (this.$storage.get(this.tokenKey)) {
      this.$storage.set(this.tokenKey, token);
      this.$storage.setCookie(this.tokenKey, token, 300);
    }

    return;
  }

  /**
   * Remove the token
   */
  public unsetToken(): void {
    // save in service
    this.token = null;

    // save to storage
    this.$storage.remove(this.tokenKey);
    this.$storage.eraseCookie(this.tokenKey);

    return;
  }

  /**
   * Get the baseUrl
   * @returns {string} baseUrl
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Process the received errorResponse
   * @param {any} errorState
   */
  public getErrorResponse(error: HttpErrorResponse): any {

    let reason = error.error;
    if (error.headers.get('content-type') === 'application/json') {
      reason = `(${error.error.code}) ${error.error.message}`;
    }

    return {
      error: error.message,
      reason,
    };
  }

  /**
   * Build url from params
   * @param {any} endpointQuery
   */
  public buildUrl(endpointQuery: any): string {
    let queryString = '';

    // build filters
    if (endpointQuery.filter) {
      for (const [key, value] of Object.entries(endpointQuery.filter)) {
        queryString += `&${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;
      }
    }

    // take & skip parameters
    const take = (endpointQuery.take && endpointQuery.take > 0 && typeof endpointQuery.take === 'number') ? endpointQuery.take : 120;
    queryString += `&take=${take}`;
    const skip = (endpointQuery.skip && endpointQuery.skip >= 0 && typeof endpointQuery.skip === 'number') ? endpointQuery.skip : 0;
    queryString += `&skip=${skip}`;

    // order by
    const orderBy = (endpointQuery.orderBy && typeof endpointQuery.orderBy === 'string') ? endpointQuery.orderBy : '';
    queryString += `&orderBy=${orderBy}`;

    return queryString;
  }

  /**
   * HTTP GET
   * @param {string} endpoint The request endpoint
   * @returns {Observable} The HTTP request
   */
  public get(endpoint: string, responseType: string = 'json', baseUrl?: string): Observable<any> {
    // return the GET request
    return this.$http.get((baseUrl || this.baseUrl) + endpoint, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}`, responseType })
    });
  }

  /**
   * HTTP POST
   * @param {string} endpoint The request endpoint
   * @param {any} payload The data payload
   * @returns {Observable} The HTTP request
   */
  public post(endpoint: string, payload: any, responseType: string = 'json', baseUrl?: string): Observable<any> {
    // return the POST request
    return this.$http.post((baseUrl || this.baseUrl) + endpoint, payload, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}`, responseType })
    });
  }

  /**
   * HTTP PUT
   * @param {string} endpoint The request endpoint
   * @param {any} payload The data payload
   * @returns {Observable} The HTTP request
   */
   public put(endpoint: string, payload: any, responseType: string = 'json', baseUrl?: string): Observable<any> {
    // return the POST request
    return this.$http.put((baseUrl || this.baseUrl) + endpoint, payload, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}`, responseType })
    });
  }

  /**
   * HTTP PATCH
   * @param {string} endpoint The request endpoint
   * @param {number|string} resourceId The ID of the resource to update
   * @param {any} payload The data payload
   * @returns {Observable} The HTTP request
   */
  public patch(endpoint: string, resourceId: number | string, payload: any, responseType: string = 'json', baseUrl?: string): Observable<any> {
    // return the PATCH request
    return this.$http.patch((baseUrl || this.baseUrl) + endpoint + (resourceId ? '/' + resourceId : ''), payload, {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}`, responseType })
    });
  }

  /**
   * HTTP DELETE
   * @param {string} endpoint The request endpoint
   * @param {number|string} resourceId The ID of the resource to delete
   * @returns {Observable} The HTTP request
   */
  public delete(endpoint: string, resourceId: number | string, responseType: string = 'json', baseUrl?: string): Observable<any> {
    // return the DELETE request
    return this.$http.delete((baseUrl || this.baseUrl) + endpoint + (resourceId ? '/' + resourceId : ''), {
      headers: new HttpHeaders({ Authorization: `Bearer ${this.getToken()}`, responseType })
    });
  }
}
