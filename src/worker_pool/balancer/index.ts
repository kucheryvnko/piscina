import {TaskInfo} from '../../task_queue';
import type { PiscinaWorker } from '..';

export type PiscinaLoadBalancer = (
  task: TaskInfo,
  workers: PiscinaWorker[]
) => PiscinaWorker | null; // If candidate is passed, it will be used as the result of the load balancer and ingore the command;

export type LeastBusyBalancerOptions = {
  maximumUsage: number;
};
export function LeastBusyBalancer (
  opts: LeastBusyBalancerOptions
): PiscinaLoadBalancer {
  const { maximumUsage } = opts;

  return (task, workers) => {
    let candidate: PiscinaWorker | null = null;
    let checkpoint = maximumUsage;
    for (const worker of workers) {
      if (worker.currentUsage === 0) {
        candidate = worker;
        break;
      }

      if (worker.isRunningAbortableTask) continue;

      if (
        !task.interface.isAbortable &&
        (worker.currentUsage < checkpoint)
      ) {
        candidate = worker;
        checkpoint = worker.currentUsage;
      }
    }

    return candidate;
  };
}
