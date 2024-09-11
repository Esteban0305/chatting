export class User {
  id    : string;
  name  : string;
  lastConnection : Date;
  ws : WebSocket

  constructor(id: string, name : string, ws: WebSocket) {
    this.id     = id;
    this.name   = name;
    this.lastConnection = new Date();
    this.ws = ws;
  }
}