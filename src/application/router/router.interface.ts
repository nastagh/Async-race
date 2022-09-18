import { Router } from '.';

export type OnRouteChange = <T = Router>(router: T, e?: HashChangeEvent) => void;

export type UrlParts = {
    url: string;
    query: string;
};
