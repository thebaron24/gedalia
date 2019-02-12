import { Injectable } from '@angular/core';
import { Observable, Observer, Subscription } from 'rxjs';
import { Zone } from 'zone.js/dist/zone';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';

@Injectable({
  providedIn: 'root'
})
export class AsyncApiCallHelperService {

  taskProcessor: MyAsyncTaskProcessor;
  constructor() {
    this.taskProcessor = new MyAsyncTaskProcessor();
  }

  doTask<T>(observable: Observable<T>) {
    return <Observable<T>> this.taskProcessor.doTaskforObservable(observable);
  }
}

//declare const Zone: any;

export abstract class ZoneMacroTaskWrapper<S, R> {
  wrap(request: R): Observable<R> {
    return new Observable((observer: Observer<R>) => {
      let task;
      let scheduled = false;
      let sub: Subscription|null = null;
      let savedResult: any = null;
      let savedError: any = null;

      // tslint:disable-next-line:no-shadowed-variable
      const scheduleTask = (_task: any) => {
        task = _task;
        scheduled = true;

        const delegate = this.delegate(request);
        sub = delegate.subscribe(
            res => savedResult = res,
            err => {
              if (!scheduled) {
                throw new Error(
                    'An http observable was completed twice. This shouldn\'t happen, please file a bug.');
              }
              savedError = err;
              scheduled = false;
              task.invoke();
            },
            () => {
              if (!scheduled) {
                throw new Error(
                    'An http observable was completed twice. This shouldn\'t happen, please file a bug.');
              }
              scheduled = false;
              task.invoke();
            });
      };

      // tslint:disable-next-line:no-shadowed-variable
      const cancelTask = (_task: any) => {
        if (!scheduled) {
          return;
        }
        scheduled = false;
        if (sub) {
          sub.unsubscribe();
          sub = null;
        }
      };

      const onComplete = () => {
        if (savedError !== null) {
          observer.error(savedError);
        } else {
          observer.next(savedResult);
          observer.complete();
        }
      };

      // MockBackend for Http is synchronous, which means that if scheduleTask is by
      // scheduleMacroTask, the request will hit MockBackend and the response will be
      // sent, causing task.invoke() to be called.
      const _task = Zone.current.scheduleMacroTask(
          'ZoneMacroTaskWrapper.subscribe', onComplete, {}, () => null, cancelTask);
      scheduleTask(_task);

      return () => {
        if (scheduled && task) {
          task.zone.cancelTask(task);
          scheduled = false;
        }
        if (sub) {
          sub.unsubscribe();
          sub = null;
        }
      };
    });
  }

  protected abstract delegate(request: R): Observable<R>;
}

export class MyAsyncTaskProcessor extends
    ZoneMacroTaskWrapper<Observable<any>, any> {

  constructor() { super(); }

  // your public tasks invocation method signature
  doTask(request: Observable<any>): Observable<any> {
    // call via ZoneMacroTaskWrapper
    return this.wrap(request);
  }

  doTaskforObservable(request: Observable<any>): Observable<any> {
    // call via ZoneMacroTaskWrapper
    return this.wrap(request);
  }

  // delegated raw implementation that will be called by ZoneMacroTaskWrapper
  protected delegate(request: Observable<any>): Observable<any> {
    return new Observable<any>((observer: Observer<any>) => {
      // calling observer.next / complete / error
      request
      .subscribe(result => {
        observer.next(result);
        observer.complete();
        observer.error(result);
      });
    });
  }
}