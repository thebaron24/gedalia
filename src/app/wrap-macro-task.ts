//export class WrapMacroTask {}

import { Zone, MacroTask } from 'zone.js/dist/zone';
import { BehaviorSubject, Observable, of, Subject, Subscription } from "rxjs";
import { switchMap, takeUntil, takeWhile, tap } from "rxjs/operators";

/*
 * These utilities help Angular Universal know when
 * the page is done loading by wrapping
 * Promises and Observables in ZoneJS Macro Tasks.
 *
 * See: https://gist.github.com/sparebytes/e2bc438e3cfca7f6687f1d61287f8d72
 * See: https://github.com/angular/angular/issues/20520
 * See: https://stackoverflow.com/a/54345373/787757
 *
 * Usage:
 *
  ```ts
  @Injectable
  class MyService {
    doSomething(): Observable<any> {
      return wrapMacroTask(getMyData())
    }
  }

  @Component
  class MyComponent {
    ngOnInit() {
      // You can use wrapMacroTask here
      wrapMacroTask(getMyData())

      // If any tasks have started outside of the component use this:
      awaitMacroTasks();
    }
  }
  ```
 *
 */

/** Override this value to change the warning time */
export const wrapMacroTaskTooLongWarningThreshold = 10000;

/**
 * Useful for waiting for tasks that started outside of a Component
 *
 * awaitMacroTasks$().subscribe()
 **/
export function awaitMacroTasks$(): Observable<number> {
  return _wrapMacroTaskObservable(macroTaskCount.pipe(takeWhile(v => v > 0)), null, "complete", false);
}

/**
 * Useful for waiting for tasks that started outside of a Component
 *
 * awaitMacroTasks()
 **/
export function awaitMacroTasks(): Subscription {
  return awaitMacroTasks$().subscribe();
}

/**
 * Starts a Macro Task for a promise or an observable
 */
export function wrapMacroTask<T>(
  request: Promise<T>,
  warnIfTakingTooLongThreshold?: number | null,
  isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
): Promise<T>;
export function wrapMacroTask<T>(
  request: Observable<T>,
  warnIfTakingTooLongThreshold?: number | null,
  isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
): Observable<T>;
export function wrapMacroTask<T>(
  /** The observable or promise to watch */
  request: Promise<T> | Observable<T>,
  /** Warn us if the request takes too long. Set to 0 to disable */
  warnIfTakingTooLongThreshold?: number | null,
  /** When do we know the request is done */
  isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
): Promise<T> | Observable<T> {
  if (request instanceof Promise) {
    return wrapMacroTaskPromise(request, warnIfTakingTooLongThreshold);
  } else if (request instanceof Observable) {
    return wrapMacroTaskObservable(request, warnIfTakingTooLongThreshold, isDoneOn);
  }

  // Backup type check
  if ("then" in request && typeof (request as any).then === "function") {
    return wrapMacroTaskPromise(request);
  } else {
    return wrapMacroTaskObservable(request as Observable<T>);
  }
}

/**
 * Starts a Macro Task for a promise
 */
export async function wrapMacroTaskPromise<T>(
  /** The Promise to watch */
  request: Promise<T>,
  /** Warn us if the request takes too long. Set to 0 to disable */
  warnIfTakingTooLongThreshold?: number | null,
): Promise<T> {
  // Initialize warnIfTakingTooLongThreshold
  if (typeof warnIfTakingTooLongThreshold !== "number") {
    warnIfTakingTooLongThreshold = wrapMacroTaskTooLongWarningThreshold;
  }

  // Start timer for warning
  let takingTooLongTimeout: any = null;
  if (warnIfTakingTooLongThreshold! > 0 && takingTooLongTimeout == null) {
    takingTooLongTimeout = setTimeout(() => {
      console.warn(
        `wrapMacroTaskPromise: Promise is taking too long to complete. Longer than ${warnIfTakingTooLongThreshold}ms.`,
      );
      clearTimeout(takingTooLongTimeout);
    }, warnIfTakingTooLongThreshold!);
  }

  // Start the task
  const task: MacroTask = Zone.current.scheduleMacroTask("wrapMacroTaskPromise", () => {}, {}, () => {}, () => {});
  macroTaskStarted();

  // Prepare function for ending the task
  function endTask() {
    task.invoke();
    macroTaskEnded();

    // Kill the warning timer
    if (takingTooLongTimeout != null) {
      clearTimeout(takingTooLongTimeout);
      takingTooLongTimeout = null;
    }
  }

  // Await the promise
  try {
    const result = await request;
    endTask();
    return result;
  } catch (ex) {
    endTask();
    throw ex;
  }
}

/**
 * Starts a Macro Task for an observable
 */
export function wrapMacroTaskObservable<T>(
  /** The observable to watch */
  request: Observable<T>,
  /** Warn us if the request takes too long. Set to 0 to disable */
  warnIfTakingTooLongThreshold?: number | null,
  /** When do we know the request is done */
  isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
): Observable<T> {
  return _wrapMacroTaskObservable(request, warnIfTakingTooLongThreshold, isDoneOn, true);
}

function _wrapMacroTaskObservable<T>(
  request: Observable<T>,
  warnIfTakingTooLongThreshold?: number | null,
  isDoneOn?: IWaitForObservableIsDoneOn<T> | null,
  isCounted: boolean = true,
): Observable<T> {
  // Determine emitPredicate
  let emitPredicate: (d: T) => boolean;
  if (isDoneOn == null || isDoneOn === "complete") {
    emitPredicate = alwaysFalse;
  } else if (isDoneOn === "first-emit") {
    emitPredicate = makeEmitCountPredicate(1);
  } else if ("emitCount" in isDoneOn) {
    emitPredicate = makeEmitCountPredicate(isDoneOn.emitCount);
  } else if ("emitPredicate" in isDoneOn) {
    emitPredicate = isDoneOn.emitPredicate;
  } else {
    console.warn("wrapMacroTaskObservable: Invalid isDoneOn value given. Defaulting to 'complete'.", isDoneOn);
    emitPredicate = alwaysFalse;
  }

  // Initialize warnIfTakingTooLongThreshold
  if (typeof warnIfTakingTooLongThreshold !== "number") {
    warnIfTakingTooLongThreshold = wrapMacroTaskTooLongWarningThreshold;
  }

  /** When task is null it means it hasn't been scheduled */
  let task: MacroTask | null = null;
  let takingTooLongTimeout: any = null;

  /** Function to call when we have determined the request is complete */
  function endTask() {
    if (task != null) {
      task.invoke();
      task = null;
      if (isCounted) macroTaskEnded();
    }

    // Kill the warning timer
    if (takingTooLongTimeout != null) {
      clearTimeout(takingTooLongTimeout);
      takingTooLongTimeout = null;
    }
  }

  /** Used if the task is cancelled */
  const unsubSubject = new Subject();
  function unsub() {
    unsubSubject.next();
    unsubSubject.complete();
  }

  return of(null)
    .pipe(
      tap(() => {
        // Start the task if one hasn't started yet
        if (task == null) {
          task = Zone.current.scheduleMacroTask("wrapMacroTaskObservable", () => {}, {}, () => {}, unsub);
        }
        if (isCounted) macroTaskStarted();

        // Start timer for warning
        if (warnIfTakingTooLongThreshold! > 0 && takingTooLongTimeout == null) {
          takingTooLongTimeout = setTimeout(() => {
            console.warn(
              `wrapMacroTaskObservable: Observable is taking too long to complete. Longer than ${warnIfTakingTooLongThreshold}ms.`,
            );
            clearTimeout(takingTooLongTimeout);
          }, warnIfTakingTooLongThreshold!);
        }
      }),
    )
    .pipe(switchMap(() => request))
    .pipe(
      tap(
        v => {
          if (task != null) {
            if (emitPredicate(v)) {
              endTask();
            }
          }
        },
        err => {
          endTask();
          unsubSubject.complete();
        },
        () => {
          endTask();
          unsubSubject.complete();
        },
      ),
    )
    .pipe(takeUntil(unsubSubject));
}

export type IWaitForObservableIsDoneOn<T = any> =
  | "complete"
  | "first-emit"
  | { emitCount: number }
  | { emitPredicate: (d: T) => boolean };

// Utilities:

function makeEmitCountPredicate(emitCount: number) {
  let count = 0;
  return () => {
    count++;
    return count >= emitCount;
  };
}

function alwaysFalse() {
  return false;
}

const macroTaskCount = new BehaviorSubject(0);

function macroTaskStarted() {
  macroTaskCount.next(macroTaskCount.value + 1);
}
function macroTaskEnded() {
  macroTaskCount.next(macroTaskCount.value - 1);
}