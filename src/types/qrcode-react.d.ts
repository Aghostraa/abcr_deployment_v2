declare module 'qrcode.react' {
    import React from 'react';
    
    export interface QRCodeProps {
      value: string;
      size?: number;
      level?: "L" | "M" | "Q" | "H";
      includeMargin?: boolean;
      imageSettings?: {
        src: string;
        x?: number;
        y?: number;
        height?: number;
        width?: number;
        excavate?: boolean;
      };
      style?: React.CSSProperties;
      id?: string;
    }
    
    export const QRCodeSVG: React.FC<QRCodeProps>;
    export const QRCodeCanvas: React.FC<QRCodeProps>;
  }