import PQueue from "p-queue";

const queue = new PQueue({
  concurrency: 1,
});

const jobQueue = {
  enqueue: async (jobFn) => {
    return queue.add(jobFn);
  },

  pause: () => {
    queue.pause();
    return "Queue paused";
  },

  start: () => {
    queue.start();
    return "Queue started";
  },

  size: () => {
    return queue.size;
  },

  pending: () => {
    return queue.pending;
  },
};

export default jobQueue;
