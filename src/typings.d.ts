import { Observable } from 'rxjs';

declare module "*.json" {
    const value: any;
    export default value;
}

declare type LinkDefinition = {
  charset?: string;
  crossorigin?: string;
  href?: string;
  hreflang?: string;
  media?: string;
  rel?: string;
  rev?: string;
  sizes?: string;
  target?: string;
  type?: string;
  } & {
  [prop: string]: string;
};