/**
 * Módulo de ordenamiento de tareas
 * Proporciona funciones para ordenar tareas por diferentes criterios
 */

export const SORT_OPTIONS = {
  NEWEST: "newest",
  OLDEST: "oldest",
  TITLE_ASC: "title-asc",
  TITLE_DESC: "title-desc",
  STATUS: "status"
};

export function sortTasks(tasks, sortBy = SORT_OPTIONS.NEWEST) {
  const sorted = [...tasks];

  switch (sortBy) {
    case SORT_OPTIONS.NEWEST:
      return sorted.sort((a, b) => Number(b.id) - Number(a.id));

    case SORT_OPTIONS.OLDEST:
      return sorted.sort((a, b) => Number(a.id) - Number(b.id));

    case SORT_OPTIONS.TITLE_ASC:
      return sorted.sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
      );

    case SORT_OPTIONS.TITLE_DESC:
      return sorted.sort((a, b) =>
        b.title.toLowerCase().localeCompare(a.title.toLowerCase())
      );

    case SORT_OPTIONS.STATUS:
      return sorted.sort((a, b) => {
        const statusOrder = { "Pendiente": 0, "En progreso": 1, "Completada": 2 };
        return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
      });

    default:
      return sorted.sort((a, b) => Number(b.id) - Number(a.id));
  }
}
