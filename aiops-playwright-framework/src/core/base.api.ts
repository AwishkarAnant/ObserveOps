import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import { Logger, logger } from '../utils/logger';

export class BaseApi {
  protected readonly log: Logger;

  constructor(protected readonly request: APIRequestContext) {
    this.log = logger(this.constructor.name);
  }

  protected async get<T>(url: string, params?: Record<string, string | number>): Promise<T> {
    const response = await this.request.get(url, params ? { params } : undefined);
    return this.parse<T>(response, 'GET', url);
  }

  protected async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.request.post(url, { data });
    return this.parse<T>(response, 'POST', url);
  }

  protected async put<T>(url: string, data: unknown): Promise<T> {
    const response = await this.request.put(url, { data });
    return this.parse<T>(response, 'PUT', url);
  }

  protected async delete(url: string): Promise<void> {
    const response = await this.request.delete(url);
    expect(response, `DELETE ${url} failed`).toBeOK();
  }

  private async parse<T>(response: APIResponse, method: string, url: string): Promise<T> {
    this.log.info('api', { method, url, status: response.status() });
    expect(response, `${method} ${url} -> ${response.status()}`).toBeOK();
    return (await response.json()) as T;
  }
}
