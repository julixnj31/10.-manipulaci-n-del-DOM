export function normalizeTask(task) {
    const createdAt = task.createdAt || getFallbackCreatedAt(task);

    return {
        ...task,
        createdAt
    };
}

export function normalizeTasks(tasks) {
    return tasks.map(normalizeTask);
}

function getFallbackCreatedAt(task) {
    const numericId = Number(task.id);

    if (!Number.isNaN(numericId) && numericId > 0) {
        return new Date(Date.now() - numericId * 1000).toISOString();
    }

    return new Date().toISOString();
}
