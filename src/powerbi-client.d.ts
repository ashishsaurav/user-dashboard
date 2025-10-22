declare module 'powerbi-client' {
  export namespace models {
    export enum TokenType {
      Aad = 0,
      Embed = 1,
    }

    export enum BackgroundType {
      Default = 0,
      Transparent = 1,
    }

    export enum LayoutType {
      Master = 0,
      Custom = 1,
      MobilePortrait = 2,
      MobileLandscape = 3,
    }

    export enum DisplayOption {
      FitToPage = 0,
      FitToWidth = 1,
      ActualSize = 2,
    }

    export enum PageSizeType {
      Widescreen = 0,
      Standard = 1,
      Letter = 2,
      Custom = 3,
    }
  }

  export namespace factories {
    export const hpmFactory: any;
    export const wpmpFactory: any;
    export const routerFactory: any;
  }

  export namespace service {
    export class Service {
      constructor(...factories: any[]);
      embed(element: HTMLElement, config: any): any;
      reset(element: HTMLElement): void;
      bootstrap(element: HTMLElement, config: any): void;
    }
  }

  export interface IEmbedConfiguration {
    type: string;
    id?: string;
    embedUrl?: string;
    accessToken?: string;
    tokenType?: models.TokenType;
    settings?: any;
  }

  export interface IReportEmbedConfiguration extends IEmbedConfiguration {
    type: 'report';
    id: string;
    embedUrl: string;
    accessToken: string;
  }

  export interface IVisualEmbedConfiguration extends IEmbedConfiguration {
    type: 'visual';
    id: string;
    embedUrl: string;
    accessToken: string;
    pageName: string;
    visualName: string;
  }

  export interface Report {
    on(event: string, handler: (event?: any) => void): void;
    off(event: string): void;
    setAccessToken(accessToken: string): Promise<void>;
    refresh(): Promise<void>;
    reload(): Promise<void;
    getPages(): Promise<any[]>;
    setFilters(filters: any[]): Promise<void>;
    powerBiEmbed?: any;
  }

  export interface Visual {
    on(event: string, handler: (event?: any) => void): void;
    off(event: string): void;
    setAccessToken(accessToken: string): Promise<void>;
    powerBiEmbed?: any;
  }
}
