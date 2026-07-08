export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class InvalidNotificationError extends DomainError {}

export class UnknownChannelError extends DomainError {
  constructor(channel: string) {
    super(`No channel registered for type "${channel}"`);
  }
}

export class TemplateNotFoundError extends DomainError {
  constructor(key: string, channel: string) {
    super(`Template "${key}" not found for channel "${channel}"`);
  }
}

export class NotificationNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Notification "${id}" not found`);
  }
}
