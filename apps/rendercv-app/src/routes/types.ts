import type { ResponseConfig, RouteConfig, ZodContentObject, ZodRequestBody } from '@asteasolutions/zod-to-openapi';
import { type OpenAPIHono } from '@hono/zod-openapi';
import type { Env, Handler, TypedResponse } from 'hono';
import type { AnyZodObject, ZodSchema } from 'zod';
import { type z } from 'zod';


export type SunoApiEnv = {
  Variables: {
  };
};

// These types mirror the ones from @hono/zod-openapi
type RequestTypes = {
  body?: ZodRequestBody;
  params?: AnyZodObject;
  query?: AnyZodObject;
  cookies?: AnyZodObject;
  headers?: AnyZodObject;
};

type IsJson<T> = T extends string ? (T extends `application/json${infer _Rest}` ? 'json' : never) : never;
type IsForm<T> = T extends string
  ? T extends `multipart/form-data${infer _Rest}` | `application/x-www-form-urlencoded${infer _Rest}`
  ? 'form'
  : never
  : never;

type RequestPart<R extends RouteConfig, Part extends string> = Part extends keyof R['request'] ? R['request'][Part] : {};

type InputTypeBase<R extends RouteConfig, Part extends string, Type extends string> = R['request'] extends RequestTypes
  ? RequestPart<R, Part> extends AnyZodObject
  ? {
    in: {
      [K in Type]: z.input<RequestPart<R, Part>>;
    };
    out: {
      [K in Type]: z.input<RequestPart<R, Part>>;
    };
  }
  : {}
  : {};

type InputTypeJson<R extends RouteConfig> = R['request'] extends RequestTypes
  ? R['request']['body'] extends ZodRequestBody
  ? R['request']['body']['content'] extends ZodContentObject
  ? IsJson<keyof R['request']['body']['content']> extends never
  ? {}
  : R['request']['body']['content'][keyof R['request']['body']['content']]['schema'] extends ZodSchema<any>
  ? {
    in: {
      json: z.input<R['request']['body']['content'][keyof R['request']['body']['content']]['schema']>;
    };
    out: {
      json: z.input<R['request']['body']['content'][keyof R['request']['body']['content']]['schema']>;
    };
  }
  : {}
  : {}
  : {}
  : {};

type InputTypeForm<R extends RouteConfig> = R['request'] extends RequestTypes
  ? R['request']['body'] extends ZodRequestBody
  ? R['request']['body']['content'] extends ZodContentObject
  ? IsForm<keyof R['request']['body']['content']> extends never
  ? {}
  : R['request']['body']['content'][keyof R['request']['body']['content']]['schema'] extends ZodSchema<any>
  ? {
    in: {
      form: z.input<R['request']['body']['content'][keyof R['request']['body']['content']]['schema']>;
    };
  out: {
    form: z.input<R['request']['body']['content'][keyof R['request']['body']['content']]['schema']>;
  };
  }
  : {}
  : {}
  : {}
  : {};

type OutputType<R extends RouteConfig> = R['responses'] extends Record<infer _, infer C>
  ? C extends ResponseConfig
  ? C['content'] extends ZodContentObject
  ? IsJson<keyof C['content']> extends never
  ? {}
  : C['content'][keyof C['content']]['schema'] extends ZodSchema
  ? z.infer<C['content'][keyof C['content']]['schema']>
  : {}
  : {}
  : {}
  : {};

type HandlerResponse<O> = TypedResponse<O> | Promise<TypedResponse<O>>;

type ConvertPathType<T extends string> = T extends `${infer _}/{${infer Param}}${infer _}` ? `/:${Param}` : T;

// Extract handler type from a route when used with OpenAPIHono<SunoApiEnv>
// This manually constructs the handler type based on the route config, matching the logic in OpenAPIHono.openapi
export type HandlerFromRoute<R extends RouteConfig> = Handler<
  SunoApiEnv,
  ConvertPathType<R['path']>,
  InputTypeBase<R, 'params', 'param'> &
  InputTypeBase<R, 'query', 'query'> &
  InputTypeBase<R, 'headers', 'header'> &
  InputTypeBase<R, 'cookies', 'cookie'> &
  InputTypeForm<R> &
  InputTypeJson<R>,
  HandlerResponse<OutputType<R>>
>;


/**
 * When using the OpenAPIHono<Env> type, this type is used to correctly type the object exported from route file.
 * @example
 * ```ts
 * import { createRoute } from '@hono/zod-openapi';
 * import { z } from 'zod';
 *
 * const route = createRoute({
 *   method: 'get',
 *   path: '/api/v1/clip',
 *   tags: ['Info'],
 * });
 * 
 * const handler: HandlerFromRoute<typeof route> = async (c) => {
 *   return c.json({ message: 'Hello, world!' });
 * };
 * 
 * export const clipRoute = {
 *   route,
 *   handler,
 * };
 * 
 * ```
 */
// export type RouteExport<E extends Env, T extends OpenAPIHono<E>['openapi']> = {
//   route: Parameters<T>[0];
//   handler: Parameters<T>[1];
// };

export type RouteExports<E extends Env, T extends OpenAPIHono<E>['openapi']> = Record<string, { route: Parameters<T>[0]; handler: Parameters<T>[1]; }>;