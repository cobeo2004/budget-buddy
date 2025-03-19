import UntypedEventEmitter, { on as onUntyped } from "node:events";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class EventEmitter<Events extends Record<string, any[]>> {
  private emitter = new UntypedEventEmitter();

  addListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.addListener(event as string, listener);
    return this;
  }

  on<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.on(event as string, listener);
    return this;
  }

  once<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.once(event as string, listener);
    return this;
  }

  removeListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.removeListener(event as string, listener);
    return this;
  }

  off<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.off(event as string, listener);
    return this;
  }

  removeAllListeners<E extends keyof Events>(event?: E): this {
    this.emitter.removeAllListeners(event as string);
    return this;
  }

  setMaxListeners(n: number): this {
    this.emitter.setMaxListeners(n);
    return this;
  }

  getMaxListeners(): number {
    return this.emitter.getMaxListeners();
  }

  listeners<E extends keyof Events>(
    event: E
  ): Array<(...args: Events[E]) => void> {
    return this.emitter.listeners(event as string) as Array<
      (...args: Events[E]) => void
    >;
  }

  rawListeners<E extends keyof Events>(
    event: E
  ): Array<(...args: Events[E]) => void> {
    return this.emitter.rawListeners(event as string) as Array<
      (...args: Events[E]) => void
    >;
  }

  emit<E extends keyof Events>(event: E, ...args: Events[E]): boolean {
    return this.emitter.emit(event as string, ...args);
  }

  listenerCount<E extends keyof Events>(event: E): number {
    return this.emitter.listenerCount(event as string);
  }

  prependListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.prependListener(event as string, listener);
    return this;
  }

  prependOnceListener<E extends keyof Events>(
    event: E,
    listener: (...args: Events[E]) => void
  ): this {
    this.emitter.prependOnceListener(event as string, listener);
    return this;
  }

  eventNames(): Array<keyof Events> {
    return this.emitter.eventNames() as Array<keyof Events>;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function on<TEvents extends Record<string, any[]>>(
  emitter: EventEmitter<TEvents>,
  event: keyof TEvents,
  options?: { signal?: AbortSignal | undefined }
): AsyncIterableIterator<TEvents[keyof TEvents]> {
  return onUntyped(emitter as UntypedEventEmitter, event as string, options) as AsyncIterableIterator<TEvents[keyof TEvents]>;
}

