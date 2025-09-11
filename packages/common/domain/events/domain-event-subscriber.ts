import type { DomainEvent } from './domain-event'
import type { DomainEventName } from './domain-event-name'

export interface DomainEventSubscriber<T extends DomainEvent> {
  on(domainEvent: T): Promise<void>
  subscribedTo(): DomainEventName<T>[]
}
