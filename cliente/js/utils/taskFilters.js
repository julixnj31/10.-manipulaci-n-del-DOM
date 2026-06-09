export function filterTasks(tasks, filters) {
    return tasks.filter((task) => {
        const matchesStatus =
            !filters.status || filters.status === "all" || task.status === filters.status;
        const matchesUser =
            !filters.user || filters.user === "all" || task.userName === filters.user;

        return matchesStatus && matchesUser;
    });
}

export function sortTasks(tasks, sortBy) {
    const sortedTasks = [...tasks];

    return sortedTasks.sort((firstTask, secondTask) => {
        switch (sortBy) {
            case "title":
                return firstTask.title.localeCompare(secondTask.title, "es", {
                    sensitivity: "base"
                });
            case "status":
                return firstTask.status.localeCompare(secondTask.status, "es", {
                    sensitivity: "base"
                });
            case "createdAt":
            default:
                return new Date(secondTask.createdAt) - new Date(firstTask.createdAt);
        }
    });
}
