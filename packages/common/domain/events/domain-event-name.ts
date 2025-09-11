import type { DomainEvent } from './domain-event'

export type DomainEventName<T extends DomainEvent> = Pick<T, 'eventName'>
