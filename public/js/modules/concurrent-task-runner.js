const DEFAULT_MAX_TASKS = 1000;

class ConcurrentTaskRunner {
  constructor({
    tasks = [],
    concurrency = 5,
    retries = 3,
    maxTasks = DEFAULT_MAX_TASKS,
    onComplete = () => {},
    debug = false
  } = {}) {
    this._concurrency = concurrency;
    this._tasks = tasks;
    this._tasksCount = tasks.length;
    this._retries = retries;
    this._inProgress = [];
    this._completed = [];
    this._deadLetter = [];
    this._maxTasks = maxTasks;
    this._debug = debug;
    this._hitMaximumTasks = false;
    this.onComplete = onComplete;
  }

  run() {
    while (this._shouldRun()) {
      const task = this.dequeue();
      this._inProgress.push(task);

      const taskPromise = typeof task === 'function' ? task() : task;

      taskPromise
        .then(() => {
          this._completed.push(taskPromise);

          if (!this._debug) {
            console.log('Completed %s tasks', this.getCompleted().length);
          }

          if (
            this._tasks.length === 0 &&
            this.getCompleted().length + this._deadLetter.length >=
              this._tasksCount
          ) {
            this.onComplete(this.getCompleted());
          }

          this.run();
        })
        .catch((err) => {
          console.error(
            `Task failed with ${err}, retry number ${
              task.retries ? task.retries + 1 : 1
            }`
          );

          if (!task.retries || task.retries < this._retries) {
            task.retries = task.retries ? task.retries + 1 : 1;
            this.enqueue(task);
          } else {
            this._deadLetter.push(task);
          }
        })
        .finally(() => {
          this._inProgress.splice(this._inProgress.indexOf(task), 1);
        });
    }
  }

  enqueue(tasks = []) {
    if (!tasks.length) {
      return true;
    }

    if (this._tasks.length + tasks.length <= this._maxTasks) {
      this._tasks.push(...tasks);
      this._tasksCount += tasks.length;
      this.run();

      return true;
    } else {
      this._hitMaximumTasks = true;
      return false;
    }
  }

  dequeue() {
    if (this._hitMaximumTasks) {
      this._hitMaximumTasks = false;
    }
    return this._tasks.shift();
  }

  getCompleted() {
    return this._completed;
  }

  _shouldRun() {
    return (
      this._inProgress.length < this._concurrency && this._tasks.length > 0
    );
  }
}
