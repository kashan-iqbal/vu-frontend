export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}