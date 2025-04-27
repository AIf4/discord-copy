import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from '../services/chat.service';

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  logger = new Logger(ChatGateway.name);

  @WebSocketServer()
  server: Server;

  private clients = new Map<string, Socket>();
  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
    // Guardar el cliente en el mapa al conectarse
    this.clients.set(client.id, client);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
    // Remover el cliente del mapa al desconectarse
    this.clients.delete(client.id);
  }

  @SubscribeMessage('create-group')
  create(@MessageBody() createChatDto: any) {
    this.logger.log('Creando grupo:', createChatDto);
    return this.chatService.create(createChatDto);
  }

  @SubscribeMessage('join-group')
  joinGroup(@MessageBody() userJoinGroupDto: any) {
    this.logger.log('uniendo al grupo:', userJoinGroupDto);
    //return this.chatService.create(createChatDto);
  }
}
