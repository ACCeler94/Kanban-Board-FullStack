import { DiffTaskData, EditTaskData, TaskType } from '../types/types';

const removeUnchangedData = (formData: EditTaskData, oldTaskData: TaskType) => {
  const diffData: DiffTaskData = { taskData: {}, subtaskData: [] };
  const { taskData: formTaskData, subtaskData: formSubtaskData } = formData;

  if (formTaskData) {
    // check for differences in taskData and add them to diffData object
    if (formTaskData.title && formTaskData.title !== oldTaskData.title)
      diffData.taskData.title = formTaskData.title;
    if (formTaskData.desc && formTaskData.desc !== oldTaskData.desc)
      diffData.taskData.desc = formTaskData.desc;
    if (formTaskData.status && formTaskData.status !== oldTaskData.status)
      diffData.taskData.status = formTaskData.status;
  }

  if (formSubtaskData && formSubtaskData.length !== 0) {
    // check for differences in subtasks
    for (const subtask of formSubtaskData) {
      // check if subtask exists in the old task data, if not - it's new and should be added
      const subtaskToCheckAgainst = oldTaskData.subtasks.find(
        (element) => element.id === subtask.id
      );

      if (!subtaskToCheckAgainst) diffData.subtaskData.push(subtask);
      else {
        if (subtask.desc !== subtaskToCheckAgainst.desc) diffData.subtaskData.push(subtask); // check only description as this is the only thing that can be changed via edit form
      }
    }
  }
  // check if the object is not empty done by editTaskValidator in useEditTask hook
  return diffData;
};

export { removeUnchangedData };
