export interface ActivityItem {
  id: string;
  actor: string;
  verb: string;
  object: string;
  target?: string;
  context?: Record<string, any>;
  timestamp?: string;
  description?: string;
} 