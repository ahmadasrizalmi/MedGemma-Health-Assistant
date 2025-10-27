
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface FileData {
  name: string;
  type: string;
  size: number;
  base64: string;
  previewUrl: string;
}

export interface MessagePart {
  text?: string;
  fileData?: FileData;
}

export interface Message {
  id: string;
  role: Role;
  parts: MessagePart[];
  timestamp: string;
}
