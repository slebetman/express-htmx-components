export type SrcObject = {
    src: string;
    integrity?: string;
    crossorigin?: string;
};
export type HrefObject = {
    href: string;
    integrity?: string;
    crossorigin?: string;
};
export type SrcUrl = SrcObject | string;
export type HrefUrl = HrefObject | string;
export type ComponentFunction = (props: any) => any;
export type Component = {
    route: core.Router;
    html: ComponentFunction;
};
export type ComponentDefinition = (props: any) => string;
export type Middleware = (req: express.Request, res: express.Response, next: express.NextFunction) => any;
/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
export function use(path: string, ...fn: (Middleware | ComponentDefinition)[]): Component;
/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
export function get(path: string, ...fn: (Middleware | ComponentDefinition)[]): Component;
/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
export function post(path: string, ...fn: (Middleware | ComponentDefinition)[]): Component;
/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
export function put(path: string, ...fn: (Middleware | ComponentDefinition)[]): Component;
/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
export function patch(path: string, ...fn: (Middleware | ComponentDefinition)[]): Component;
/**
 * @param {string} path
 * @param {...(Middleware|ComponentDefinition)} fn
 * @returns {Component}
 */
export function del(path: string, ...fn: (Middleware | ComponentDefinition)[]): Component;
/**
 * @param {core.Router} app
 * @param {string} componentsDir
 * @param {Object} [options]
 * @param {HrefUrl[]} options.css - list of css to include
 * @param {SrcUrl[]} options.js - list of javascript to include
 * @param {SrcUrl} options.htmx - the htmx library to include
 * @param {HrefUrl} options.favicon - favicon
 * @param {Object[]} options.link - generic link tag
*/
export function init(app: core.Router, componentsDir: string, options?: {
    css: HrefUrl[];
    js: SrcUrl[];
    htmx: SrcUrl;
    favicon: HrefUrl;
    link: any[];
}): Promise<any>;
import core = require("express-serve-static-core");
import express = require("express");
export { del as delete };
//# sourceMappingURL=main.d.ts.map