import EventEmitter from "./event-emitter";


export interface IEventEmitterService<
  TEventName extends string,
  TFunction extends Array<unknown>,
  TEvent extends Record<TEventName, TFunction> = Record<TEventName, TFunction>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TEventEmitter extends EventEmitter<TEvent> = any
> {
  getEmitter(): TEventEmitter;
}

export default class EventEmitterService<
  TEventName extends string,
  TFunction extends Array<unknown>,
  TEvent extends Record<TEventName, TFunction> = Record<TEventName, TFunction>
> implements IEventEmitterService<TEventName, TFunction, TEvent>
{
  private emitter: EventEmitter<TEvent> | undefined;

  public getEmitter(): EventEmitter<TEvent> {
    if (!this.emitter) {
      this.emitter = new EventEmitter<TEvent>();
    }
    return this.emitter;
  }
}