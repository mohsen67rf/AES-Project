// src/types/dxf-parser.d.ts

declare module 'dxf-parser' {
  export interface DXFPoint {
    x: number;
    y: number;
    z: number;
  }

  export interface DXFEntity {
    type: string;
    vertices?: DXFPoint[];
    start?: DXFPoint;
    end?: DXFPoint;
    x?: number;
    y?: number;
    z?: number;
  }

  export interface DXFResult {
    entities: DXFEntity[];
    blocks: Record<string, any>;
    header: Record<string, any>;
    tables: Record<string, any>;
  }

  export default class DxfParser {
    parseSync(content: string): DXFResult;
    parse(content: string, callback: (err: Error | null, result: DXFResult) => void): void;
  }
}