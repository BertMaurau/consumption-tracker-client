import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor() { }

  /**
   * Save an item to localStorage
   * @param {string} key name
   * @param {any} value value
   * @returns {void}
   */
  public set(key: string, value: any): void {
    localStorage.setItem(key, value);
  }

  /**
   * Get an item from localStorage
   * @param {string} key name
   * @returns {string}
   */
  public get(key: string): string {
    return localStorage.getItem(key);
  }

  /**
   * Remove an item from localStorage
   * @param {string} key name
   * @returns {void}
   */
  public remove(key: string): void {
    return localStorage.removeItem(key);
  }

  /**
   * Clear all managed localStorage items
   */
  public clear(): void {
    localStorage.clear();
  }

  public setCookie(name: string, value: any, days?: number): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + (value || '') + expires + '; domain=.bertmaurau.be; path=/';
  }
  public getCookie(name: string): any {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') { c = c.substring(1, c.length); }
      if (c.indexOf(nameEQ) == 0) { return c.substring(nameEQ.length, c.length); }
    }
    return null;
  }
  public eraseCookie(name: string): void {
    document.cookie = name + '=; domain=.bertmaurau.be; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}
