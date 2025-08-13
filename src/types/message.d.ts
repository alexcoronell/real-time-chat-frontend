export interface Message {
  id: number;
  content: string;
  createdAt: Date;
  sender: User;
  conversationId: number; // El ID de la conversación a la que pertenece
  status?: MessageStatus[]; // El estado del mensaje, opcionalmente
}