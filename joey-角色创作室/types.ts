
export interface JoeyConfig {
  action: string;
  clothing: string;
  accessory: string;
  scene: string;
  styleDescription: string;
  aspectRatio: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  config: JoeyConfig;
  timestamp: number;
}
